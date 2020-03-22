let DOMAIN = '';

if (window.__NODE_ENV === 'production') {
  DOMAIN = '';
} else {
  DOMAIN = 'http://127.0.0.1:5000';
}

export default DOMAIN;