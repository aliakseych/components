from django.contrib import admin
from django.urls import path

from api import agent, business_ai, mcp, views
from api import business_company
from api import business_actions
from api import business_insights
from api import business_mcp

urlpatterns = [
    path('api/agent/tokens/', agent.tokens),
    path('api/agent/tokens/<int:token_id>/revoke/', agent.revoke_token),
    path('api/agent/actions/', agent.actions),
    path('api/agent/actions/<int:action_id>/execute/', agent.execute_action),
    path('api/agent/actions/<int:action_id>/reject/', agent.reject_action),
    path('api/mcp/', mcp.mcp),
    path('admin/', admin.site.urls),
    path('api/health/', views.health),
    path('api/auth/login/', views.login_view),
    path('api/auth/register/', views.register),
    path('api/auth/logout/', views.logout_view),
    path('api/me/', views.me),
    path('api/profile/', views.profile),
    path('api/ai/chat/', views.ai_chat),
    path('api/ai/insights/', views.ai_insights),
    path('api/ai/deal/<int:deal_id>/', views.ai_deal),
    path('api/companies/<int:company_id>/', views.company_view),
    path('api/business/auth/csrf/', views.business_csrf),
    path('api/business/auth/login/', views.business_login),
    path('api/business/auth/logout/', views.business_logout),
    path('api/business/me/', views.business_me),
    path('api/business/mcp/', business_mcp.endpoint),
    path('api/business/agent/tokens/', business_mcp.tokens),
    path('api/business/agent/tokens/<int:token_id>/revoke/', business_mcp.revoke_token),
    path('api/business/company/', business_company.company),
    path('api/business/ai/chat/', business_ai.business_chat),
    path('api/business/ai/insights/', business_insights.insights),
    path('api/business/ai/deal/<int:deal_id>/', business_insights.deal_opinion),
    path('api/business/actions/', business_actions.actions),
    path('api/business/actions/<int:action_id>/execute/', business_actions.execute_action),
    path('api/business/actions/<int:action_id>/reject/', business_actions.reject_action),
    path('api/business/overview/', views.business_overview),
    path('api/business/deals/', views.business_deals),
    path('api/business/deals/<int:deal_id>/', views.business_deal_detail),
    path('api/business/payments/', views.business_payments),
    path('api/business/requests/', views.business_requests),
    path('api/business/requests/<int:request_id>/', views.business_request_detail),
    path('api/stats/', views.stats),
    path('api/pools/', views.pools),
    path('api/deals/', views.deal_list),
    path('api/deals/<int:deal_id>/', views.deal_detail_view),
    path('api/deals/<int:deal_id>/invest/', views.deal_invest),
    path('api/deals/<int:deal_id>/installments/<int:number>/pay/', views.installment_pay),
    path('api/portfolio/', views.portfolio),
    path('api/operations/', views.operations),
    path('api/account/topup/', views.topup_view),
]
