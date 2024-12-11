declare global {
  interface XMLHttpRequest {
    _interceptedUrl?: string;
  }
}

export const setupXHRInterceptor = () => {
  const targetEndpoint = "https://api.socket.tech/v2/token-lists/";

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null
  ) {

    let modifiedUrl = typeof url === 'string' ? url : url.toString();
    if (modifiedUrl.includes(targetEndpoint)) {

      const urlObj = new URL(modifiedUrl);

      if (urlObj.searchParams.has('isShortList')) {
        urlObj.searchParams.set('isShortList', 'false');
      }

      modifiedUrl = urlObj.toString();
    }

    this._interceptedUrl = modifiedUrl;

    return originalOpen.call(this, method, modifiedUrl, async, username, password);
  };

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    return originalSend.call(this, body);
  };
};
