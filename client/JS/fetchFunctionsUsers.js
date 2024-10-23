import { securelyGetAccessToken } from "./fetchFunctions.js"
import { BACKEND_URL } from "./appconfig.js";

export const setup2FA = async () => {
	const accessToken = await securelyGetAccessToken();
	try {
		let response = await fetch(`${BACKEND_URL}/api/setup_2fa/`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		if (!response.ok) throw new Error("Failed to setup 2FA");
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error.message);
	}
}

export const verify2FA = async (otpToken) => {
	const accessToken = await securelyGetAccessToken();
	try {
		let response = await fetch(`${BACKEND_URL}/api/setup_2fa/`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ otp_token: otpToken }),
		});
		if (!response.ok) throw new Error("Failed to verify 2FA");
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error.message);
	}
}

export const deleteUser = async () => {
	const accessToken = await securelyGetAccessToken();
	try {
		let response = await fetch(`${BACKEND_URL}/api/delete_account/`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		if (!response.ok) throw new Error("Failed to delete user");
		return ;
	} catch (error) {
		console.error(error.message);
	}
}

export const anonymizeUser = async () => {
	const accessToken = await securelyGetAccessToken();
	try {
		let response = await fetch(`${BACKEND_URL}/api/anonymize_user/`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		if (!response.ok) throw new Error("Failed to anonymise user");
		return await response.json(); 
	} catch (error) {
		console.error(error.message);
	}
}