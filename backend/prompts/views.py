import json
import redis
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.core.cache import cache

from .models import Prompt, Tag

# Redis connection
r = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True
)


def prompt_to_dict(prompt, include_tags=True):
    """Serialize a Prompt instance to dict."""
    data = {
        'id': prompt.id,
        'title': prompt.title,
        'complexity': prompt.complexity,
        'created_at': prompt.created_at.isoformat(),
    }
    if include_tags:
        data['tags'] = [tag.name for tag in prompt.tags.all()]
    return data


def prompt_detail_to_dict(prompt, view_count):
    """Serialize full Prompt detail including content and view_count."""
    data = prompt_to_dict(prompt)
    data['content'] = prompt.content
    data['view_count'] = view_count
    return data


@csrf_exempt
@require_http_methods(["GET", "POST"])
def prompt_list(request):
    """
    GET  /prompts/  - List all prompts (supports ?tag=<name> filter)
    POST /prompts/  - Create a new prompt
    """
    if request.method == "GET":
        tag_filter = request.GET.get('tag', None)
        prompts_qs = Prompt.objects.prefetch_related('tags').all()

        if tag_filter:
            prompts_qs = prompts_qs.filter(tags__name__iexact=tag_filter)

        prompts_data = [prompt_to_dict(p) for p in prompts_qs]
        return JsonResponse(prompts_data, safe=False, status=200)

    # POST
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required to create prompts.'}, status=401)
        
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    title = body.get('title', '').strip()
    content = body.get('content', '').strip()
    complexity = body.get('complexity')
    tag_names = body.get('tags', [])

    # Validation
    errors = {}
    if not title:
        errors['title'] = 'Title is required.'
    elif len(title) < 3:
        errors['title'] = 'Title must be at least 3 characters.'

    if not content:
        errors['content'] = 'Content is required.'
    elif len(content) < 20:
        errors['content'] = 'Content must be at least 20 characters.'

    if complexity is None:
        errors['complexity'] = 'Complexity is required.'
    else:
        try:
            complexity = int(complexity)
            if complexity < 1 or complexity > 10:
                errors['complexity'] = 'Complexity must be between 1 and 10.'
        except (ValueError, TypeError):
            errors['complexity'] = 'Complexity must be an integer.'

    if errors:
        return JsonResponse({'errors': errors}, status=400)

    # Create prompt
    prompt = Prompt.objects.create(
        title=title,
        content=content,
        complexity=complexity
    )

    # Handle tags
    if tag_names and isinstance(tag_names, list):
        for name in tag_names:
            name = name.strip().lower()
            if name:
                tag, _ = Tag.objects.get_or_create(name=name)
                prompt.tags.add(tag)

    return JsonResponse(prompt_to_dict(prompt), status=201)


@csrf_exempt
@require_http_methods(["GET"])
def prompt_detail(request, prompt_id):
    """
    GET /prompts/<id>/ - Retrieve a prompt and increment Redis view counter.
    """
    try:
        prompt = Prompt.objects.prefetch_related('tags').get(pk=prompt_id)
    except Prompt.DoesNotExist:
        return JsonResponse({'error': 'Prompt not found.'}, status=404)

    # Increment Redis view counter
    key = f"prompt:{prompt.id}:views"
    view_count = r.incr(key)

    return JsonResponse(prompt_detail_to_dict(prompt, int(view_count)), status=200)


@require_http_methods(["GET"])
def tag_list(request):
    """GET /tags/ - List all available tags."""
    tags = Tag.objects.values_list('name', flat=True).order_by('name')
    return JsonResponse(list(tags), safe=False, status=200)
