from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.organizations.views import OrganizationViewSet
from apps.crm.views import CompanyViewSet, ContactViewSet, DashboardStatsView
from apps.activity.views import ActivityLogViewSet
from apps.users.views import RegisterView, MeView, UserListView
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.tokens import CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # nested contacts under companies
    path(
        'companies/<uuid:company_pk>/contacts/',
        ContactViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='company-contacts-list',
    ),
    path(
        'companies/<uuid:company_pk>/contacts/<uuid:pk>/',
        ContactViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='company-contacts-detail',
    ),

    path('', include(router.urls)),
]
