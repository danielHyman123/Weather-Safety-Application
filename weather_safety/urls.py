"""
URL configuration for weather_safety project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from pages.views import home_view
from core.views import add_friend, check_current_disasters, check_friend_disasters, delete_friend, FriendList, PlaceList, get_friends_locations

admin.site.site_header = "Weather Safety Admin"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('add-friend/', add_friend, name='add_friend'),
    path('delete-friend/<int:friend_id>/', delete_friend, name='delete_friend'),
    # path('api/disasters/', getDisasterLocation, name='get_disaster_location'),
    path('api/', include('core.urls')),

    path('api/check-friend-disasters/', check_friend_disasters, name='check_friend_disasters'),
    path('api/friends-locations/', get_friends_locations, name='friends_locations'),
    path('api/check-current-disasters/', check_current_disasters, name='check_current_disasters'),

]
