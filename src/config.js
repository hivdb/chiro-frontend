let DOMAIN = '';
if (!process.env.REACT_APP_ENVIRONMENT || process.env.REACT_APP_ENVIRONMENT === 'development') {
    DOMAIN = 'http://127.0.0.1:5000';
} else {
    DOMAIN = '';
}
 
export default DOMAIN; 