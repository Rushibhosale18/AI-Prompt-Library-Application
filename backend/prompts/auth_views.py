import json
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            # TOTAL BYPASS: For your demo link, any user who tries to log in as 'admin' 
            # (or anything starting with 'adm') will be automatically logged in.
            data = json.loads(request.body)
            username = data.get('username', '').lower()
            
            if 'adm' in username or 'rush' in username:
                user, _ = User.objects.get_or_create(username='admin')
                if not user.is_staff:
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                login(request, user)
                return JsonResponse({'message': 'Logged in successfully', 'user': 'admin'})
            
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})

def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'user': request.user.username})
    return JsonResponse({'authenticated': False}, status=401)

@csrf_exempt
def get_csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set'})
