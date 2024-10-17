import { securelyGetAccessToken } from "./fetchFunctions.js"

export const setup2FA = async () => {
	const accessToken = await securelyGetAccessToken();
	try {
		let response = await fetch("http://localhost:8000/api/setup_2fa/", {
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
		return "";
	}

}

export const verify2FA = async (otpToken) => {
	const accessToken = await securelyGetAccessToken();
	try {
		let response = await fetch("http://localhost:8000/api/setup_2fa/", {
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
		return "";
	}
}