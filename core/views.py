# core/views.py
from rest_framework import generics
from .models import Friend, Place
from .serializer import FriendSerializer, PlaceSerializer

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required

import json, requests, os, math

class FriendList(generics.ListAPIView):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer


class PlaceList(generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

@csrf_exempt
def add_friend(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        lat = data.get('lat')
        lng = data.get('lng')

        if name and lat and lng:
            friend = Friend.objects.create(name=name, lat=lat, lng=lng)
            return JsonResponse({'status': 'success', 'id': friend.id})

    return JsonResponse({'status': 'error', 'message': 'Invalid data'}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_friend(request, friend_id):
    try:
        friend = Friend.objects.get(id=friend_id)
        friend.delete()
        return JsonResponse({'status': 'deleted'})
    except Friend.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Friend not found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
    



def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    return c * r

@csrf_exempt  # You might want to handle CSRF properly instead
@require_http_methods(["POST"])
@login_required  # Optional: if you want only logged-in users
def check_friend_disasters(request):
    """
    API endpoint to check if friends are near disasters
    Expects JSON payload with disasters array and proximity_radius
    """
    try:
        data = json.loads(request.body)
        disasters = data.get('disasters', [])
        proximity_radius = data.get('proximity_radius', 20)  # Default 20km
        
        # Get all friends from database
        friends = Friend.objects.all()  # Adjust based on your model
        
        affected_friends = []
        
        for friend in friends:
            # Skip friends without coordinates
            if not friend.latitude or not friend.longitude:
                continue
                
            friend_lat = float(friend.latitude)
            friend_lng = float(friend.longitude)
            
            # Check against each disaster
            for disaster in disasters:
                disaster_lat = disaster.get('lat')
                disaster_lng = disaster.get('lng')
                disaster_type = disaster.get('type', 'Unknown')
                
                if disaster_lat is None or disaster_lng is None:
                    continue
                
                distance = haversine_distance(
                    friend_lat, friend_lng,
                    float(disaster_lat), float(disaster_lng)
                )
                
                if distance <= proximity_radius:
                    affected_friends.append({
                        'name': friend.name,
                        'hazard': disaster_type,
                        'distance': round(distance, 1),
                        'coordinates': {
                            'lat': friend_lat,
                            'lng': friend_lng
                        }
                    })
                    break  # One alert per friend
        
        return JsonResponse({
            'status': 'success',
            'affected_friends': affected_friends,
            'total_friends_checked': friends.count(),
            'proximity_radius_km': proximity_radius
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["GET"])
@login_required
def get_friends_locations(request):
    """
    API endpoint to get all friends with their locations
    """
    try:
        friends = Friend.objects.all()
        friends_data = []
        
        for friend in friends:
            if friend.latitude and friend.longitude:
                friends_data.append({
                    'id': friend.id,
                    'name': friend.name,
                    'latitude': float(friend.latitude),
                    'longitude': float(friend.longitude),
                    # Add other fields as needed
                })
        
        return JsonResponse({
            'status': 'success',
            'friends': friends_data,
            'count': len(friends_data)
        })
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# Alternative: Simple GET endpoint that checks current disasters
@require_http_methods(["GET"])
def check_current_disasters(request):
    """
    Alternative endpoint that fetches disasters server-side
    You'd need to implement the Kontur API call here
    """
    try:
        # You would implement Kontur API fetching here
        # For now, returning a placeholder
        
        friends = Friend.objects.all()
        # ... implement disaster fetching and checking logic
        
        return JsonResponse({
            'status': 'success',
            'message': 'Feature not implemented yet - use client-side checking'
        })
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
