import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Logged in successfully', 'user': username})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception:
            return JsonResponse({'error': 'Invalid request'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set'})

def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'user': request.user.username})
    return JsonResponse({'authenticated': False}, status=401)
