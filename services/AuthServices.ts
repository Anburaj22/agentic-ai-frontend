import { jwtDecode } from 'jwt-decode';

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
}

interface UserInfo {
  email: string;
  given_name: string;
  family_name: string;
  groups?: string[];
}

export const exchangeCognitoToken = async (code: string): Promise<{ user: UserInfo; tokens: TokenResponse } | null> => {
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!;
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!;
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;

  if (!clientId || !clientSecret || !redirectUri || !domain) {
    throw new Error("Missing environment variables for Cognito configuration");
  }

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
  });

  const response = await fetch(`${domain}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Token exchange failed");
  }

  const userInfoResp = await fetch(`${domain}/oauth2/userInfo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });

  const userInfo = await userInfoResp.json();

  // Extract user info
  const fullName = `${userInfo.given_name} ${userInfo.family_name}`;
  const decodedToken: any = jwtDecode(data.access_token);
  const groups = decodedToken?.['cognito:groups'] || [];

  return {
    user: {
      email: userInfo.email,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      groups,
    },
    tokens: {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
    },
  };
};