from django.shortcuts import render

# Create your views here.
def home_view(request, *args, **kwargs):
    return render(request, "home.html", {})



# # import json
# # import requests
# # from django.http import JsonResponse
# # from django.shortcuts import render
# # import os

# # # Load API key
# # CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config.json')
# # with open(CONFIG_PATH) as f:
# #     config = json.load(f)
# # API_KEY = config['KONTUR_API_TOKEN']

# # def home(request):
# #     return render(request, 'home.html')

# # def kontur_data(request):
# #     bbox = "-90,30,-89,31"  # Customize or make dynamic
# #     #url = f"https://api.kontur.io/disaster/v1/disaster?bbox={bbox}&access_token={API_KEY}"
# #     url = f"https://api.kontur.io/disaster/v1/disaster?bbox={bbox}&access_token={API_KEY}"


# #     try:
# #         response = requests.get(url)
# #         response.raise_for_status()
# #         return JsonResponse(response.json())
# #     except requests.RequestException as e:
# #         return JsonResponse({'error': str(e)}, status=500)
# # # import json
# # # import requests
# # # from django.http import JsonResponse
# # # from django.shortcuts import render
# # # from django.views.decorators.csrf import csrf_exempt
# # # import os
# # # import logging

# # # # Set up logging
# # # logger = logging.getLogger(__name__)

# # # # Load API key
# # # CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config.json')
# # # try:
# # #     with open(CONFIG_PATH) as f:
# # #         config = json.load(f)
# # #     API_KEY = config['KONTUR_API_TOKEN']
# # # except FileNotFoundError:
# # #     logger.error(f"Config file not found at {CONFIG_PATH}")
# # #     API_KEY = None
# # # except KeyError:
# # #     logger.error("KONTUR_API_TOKEN not found in config file")
# # #     API_KEY = None

# # # def home(request):
# # #     return render(request, 'home.html')

# # # def home_view(request):
# # #     """Alternative home view name to match your urls.py"""
# # #     return render(request, 'home.html')

# # # def kontur_data(request):
# # #     """Fetch disaster data from Kontur API and return as JSON"""
    
# # #     if not API_KEY:
# # #         return JsonResponse({
# # #             'error': 'API key not configured',
# # #             'features': []
# # #         }, status=500)
    
# # #     # Get bounding box from request parameters or use default
# # #     # Format: bbox=min_lon,min_lat,max_lon,max_lat
# # #     bbox = request.GET.get('bbox', "-90,30,-89,31")  # Default to Louisiana area
    
# # #     # Kontur API endpoint
# # #     url = f"https://api.kontur.io/disaster/v1/events"
    
# # #     params = {
# # #         'bbox': bbox,
# # #         'access_token': API_KEY,
# # #         'format': 'geojson'  # Ensure we get GeoJSON format
# # #     }

# # #     try:
# # #         logger.info(f"Fetching Kontur data with bbox: {bbox}")
# # #         response = requests.get(url, params=params, timeout=10)
# # #         response.raise_for_status()
        
# # #         data = response.json()
# # #         logger.info(f"Successfully fetched Kontur data: {len(data.get('features', []))} features")
        
# # #         return JsonResponse(data)
        
# # #     except requests.exceptions.Timeout:
# # #         logger.error("Timeout while fetching Kontur data")
# # #         return JsonResponse({
# # #             'error': 'Request timeout',
# # #             'features': []
# # #         }, status=408)
        
# # #     except requests.exceptions.RequestException as e:
# # #         logger.error(f"Error fetching Kontur data: {str(e)}")
# # #         return JsonResponse({
# # #             'error': f'Failed to fetch disaster data: {str(e)}',
# # #             'features': []
# # #         }, status=500)
        
# # #     except json.JSONDecodeError as e:
# # #         logger.error(f"Invalid JSON response from Kontur API: {str(e)}")
# # #         return JsonResponse({
# # #             'error': 'Invalid response from disaster data service',
# # #             'features': []
# # #         }, status=502)


# import json
# import requests
# from django.http import JsonResponse
# from django.shortcuts import render
# import os
# import logging

# # Set up logging
# logger = logging.getLogger(__name__)

# # Load API key
# CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config.json')
# try:
#     with open(CONFIG_PATH) as f:
#         config = json.load(f)
#     API_KEY = config['KONTUR_API_TOKEN']
# except FileNotFoundError:
#     logger.error(f"Config file not found at {CONFIG_PATH}")
#     API_KEY = None
# except KeyError:
#     logger.error("KONTUR_API_TOKEN not found in config file")
#     API_KEY = None

# def home(request):
#     return render(request, 'home.html')

# def home_view(request):
#     """Alternative home view name to match your urls.py"""
#     return render(request, 'home.html')

# def kontur_data(request):
#     """Fetch disaster data from Kontur API and return as JSON"""
    
#     if not API_KEY:
#         return JsonResponse({
#             'error': 'API key not configured',
#             'type': 'FeatureCollection',
#             'features': []
#         }, status=500)
    
#     # Get bounding box from request parameters or use broader default
#     # Format: bbox=min_lon,min_lat,max_lon,max_lat
#     bbox = request.GET.get('bbox', "-180,-90,180,90")  # Global to find any disasters
    
#     # Correct Kontur API endpoint for events
#     url = "https://api.kontur.io/disaster/v1/events"
    
#     params = {
#         'bbox': bbox,
#         'access_token': API_KEY,
#         'format': 'geojson'  # Ensure we get GeoJSON format
#     }

#     try:
#         logger.info(f"Fetching Kontur data with bbox: {bbox}")
#         response = requests.get(url, params=params, timeout=15)
#         response.raise_for_status()
        
#         data = response.json()
#         logger.info(f"Successfully fetched Kontur data: {len(data.get('features', []))} features")
        
#         # Log the response for debugging
#         print(f"Kontur API Response: {json.dumps(data, indent=2)[:500]}...")
        
#         return JsonResponse(data)
        
#     except requests.exceptions.Timeout:
#         logger.error("Timeout while fetching Kontur data")
#         return JsonResponse({
#             'error': 'Request timeout',
#             'type': 'FeatureCollection',
#             'features': []
#         }, status=408)
        
#     except requests.exceptions.RequestException as e:
#         logger.error(f"Error fetching Kontur data: {str(e)}")
#         return JsonResponse({
#             'error': f'Failed to fetch disaster data: {str(e)}',
#             'type': 'FeatureCollection',
#             'features': []
#         }, status=500)
        
#     except json.JSONDecodeError as e:
#         logger.error(f"Invalid JSON response from Kontur API: {str(e)}")
#         return JsonResponse({
#             'error': 'Invalid response from disaster data service',
#             'type': 'FeatureCollection',
#             'features': []
#         }, status=502)

import json
import requests
from django.http import JsonResponse
from django.shortcuts import render
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Load API key
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config.json')
try:
    with open(CONFIG_PATH) as f:
        config = json.load(f)
    API_KEY = config['KONTUR_API_TOKEN']
except FileNotFoundError:
    logger.error(f"Config file not found at {CONFIG_PATH}")
    API_KEY = None
except KeyError:
    logger.error("KONTUR_API_TOKEN not found in config file")
    API_KEY = None

def home(request):
    return render(request, 'home.html')

def home_view(request):
    """Alternative home view name to match your urls.py"""
    return render(request, 'home.html')

def kontur_data(request):
    """Fetch disaster data from Kontur API and return as JSON"""
    
    if not API_KEY:
        logger.error("API key not configured")
        return JsonResponse({
            'error': 'API key not configured',
            'type': 'FeatureCollection',
            'features': []
        }, status=500)
    
    # Get bounding box from request parameters or use default (London area)
    bbox = request.GET.get('bbox', "-1,51,1,52")
    
    # Kontur API endpoints to try
    endpoints = [
        "https://api.kontur.io/disaster/v1/events",
        "https://api.kontur.io/disasters/events"
    ]
    
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    params = {
        'bbox': bbox,
        'format': 'geojson'
    }

    for url in endpoints:
        try:
            logger.info(f"Trying endpoint: {url} with bbox: {bbox}")
            response = requests.get(url, params=params, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Successfully fetched data from {url}: {len(data.get('features', []))} features")
                return JsonResponse(data)
            elif response.status_code == 401:
                logger.error("Authentication failed - check API key")
                continue
            else:
                logger.warning(f"Endpoint {url} returned status {response.status_code}")
                continue
                
        except requests.exceptions.Timeout:
            logger.error(f"Timeout while fetching from {url}")
            continue
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching from {url}: {str(e)}")
            continue
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from {url}: {str(e)}")
            continue
    
    # If all endpoints failed, try a mock response for testing
    logger.warning("All endpoints failed, returning mock data for testing")
    mock_data = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-0.09, 51.505]
                },
                'properties': {
                    'name': 'Test Disaster Event',
                    'type': 'Test',
                    'severity': 'Medium',
                    'date': '2024-01-01',
                    'description': 'This is a test disaster event for development purposes'
                }
            }
        ]
    }
    
    return JsonResponse(mock_data)