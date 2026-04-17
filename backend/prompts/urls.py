from django.urls import path
from . import views, auth_views

urlpatterns = [
    path('prompts/', views.prompt_list, name='prompt-list'),
    path('prompts/<int:prompt_id>/', views.prompt_detail, name='prompt-detail'),
    path('tags/', views.tag_list, name='tag-list'),
    
    # Auth Endpoints
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    path('auth/check/', auth_views.check_auth, name='auth-check'),
    path('auth/csrf/', auth_views.get_csrf_token, name='get-csrf'),
]
