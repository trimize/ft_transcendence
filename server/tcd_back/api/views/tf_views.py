from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from qrcode import make as make_qr
from io import BytesIO
import base64

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    user = request.user
    device, created = TOTPDevice.objects.get_or_create(user=user, name='default')

	token = request.POST.get('otp_token')
	if device.verify_token(token):
		device.confirmed = True
		device.save()
		return Response({'message': '2FA setup complete'}, status=status.HTTP_200_OK)

    qr_code_url = device.config_url
    qr_code = make_qr(qr_code_url)
    stream = BytesIO()
    qr_code.save(stream, "PNG")
    qr_code_img = base64.b64encode(stream.getvalue()).decode('utf-8')

    return Response({'qr_code_img': qr_code_img}, status=status.HTTP_200_OK) #QRCode is an image encoded in base64

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    username = request.data.get('username')
    token = request.data.get('token')
    user = authenticate(username=username)

    if user is not None:
        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if device and device.verify_token(token):
            # 2FA token is valid, return tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid 2FA token'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': 'Invalid user'}, status=status.HTTP_401_UNAUTHORIZED)