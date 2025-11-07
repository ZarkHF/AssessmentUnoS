const BASE_URL = process.env.APIURL ?? "/";

export const ApiService = {
  async testApi(accessToken) {    
    const res = await fetch(`${BASE_URL}api/test`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    console.info(res);
    if (res.ok == true) {
      return await res.json();
    }
  }  
}
