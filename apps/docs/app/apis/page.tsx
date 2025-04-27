'use client'

import './page.css';

export default function APIs() {
  const apis = [
    {
      name: 'Register',
      curl: 'curl -X POST "/api/auth/register?email=jason@example.com&password=123456"'
    },
    {
      name: 'Login',
      curl: 'curl -X POST "/api/auth/login --data-raw \"{\"email\":\"root@example.com\",\"password\":\"123456\"}\""'
    },
    {
      name: 'Login',
      curl: 'curl -X POST "/api/auth/login --data-raw \"{\"email\":\"jason@example.com\",\"password\":\"123456\"}\""'
    },
    {
      name: 'Create User',
      curl: 'curl -X POST "/api/users?email=test1@example.com&name=test1" -H "Authorization: Bearer <your_admin_token>"'
    },
    {
      name: 'Find One User by Email',
      curl: 'curl -X GET "/api/users/email/jason@example.com" -H "Authorization: Bearer <your_admin_token>"'
    },
    {
      name: 'Find All Users',
      curl: 'curl -X GET "/api/users" -H "Authorization: Bearer <your_admin_token>"'
    },
    {
      name: 'Update User',
      curl: 'curl -X PUT "/api/users/1" -H "Authorization: Bearer <your_admin_token>"'
    },
    {
      name: 'Delete User',
      curl: 'curl -X DELETE "/api/users/1" -H "Authorization: Bearer <your_admin_token>"'
    },
  ];

  const prefix = 'http://localhost:4000/api'
  const token = localStorage.getItem('token');

  const formatCurl = (curl: string) => {
    curl = curl.replace('/api', prefix);
    curl = curl.replace('<your_admin_token>', token || '');
    return curl;
  };

  const handleCopy = (curl: string) => {
    navigator.clipboard.writeText(formatCurl(curl));
    console.log('Copied to clipboard:', curl);
  };

  const handleRun = (curl: string) => {
    console.log('curl.split()[3]', curl.split(' '))
    const url = 'http://localhost:4000' + (curl.split(' ')[3] || '');
    const method = curl.split(' ')[2];
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  };

  const renderApis = () => {
    return apis.map((api) => (
      <div key={api.name}className="api-card">
        <div className="api-header">
          <h2>{api.name}</h2>
          <div className="api-buttons">
            <button onClick={() => handleCopy(api.curl)} >Copy</button>
            <button onClick={() => handleRun(api.curl)}>Run</button>
          </div>
        </div>
        <pre>{api.curl}</pre>
      </div>
    ));
  };
  return <div>
    <h1>APIs</h1>
    {renderApis()}
  </div>;
};