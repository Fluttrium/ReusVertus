// Быстрая проверка авторизации с обновленными данными
const clientId = '3gN42pjdthsmCFHec3eCzwOpGqB1nyRV';
const clientSecret = 'LFZBDpxKRkJzCnddGvVaAPXAnFqu86eM'; // Обновлено с M в конце

const prodUrl = 'https://api.cdek.ru/v2/oauth/token';

async function testAuth() {
  console.log('Тестирование авторизации СДЭК с обновленными данными...\n');
  
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(prodUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ УСПЕХ! Авторизация работает!');
      console.log(`   Access Token: ${data.access_token.substring(0, 30)}...`);
      console.log(`   Expires in: ${data.expires_in} секунд`);
      return true;
    } else {
      console.log(`❌ ОШИБКА: ${response.status} ${response.statusText}`);
      const error = JSON.parse(responseText);
      console.log(`   Error: ${error.error}`);
      console.log(`   Description: ${error.error_description}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ОШИБКА запроса: ${error.message}`);
    return false;
  }
}

testAuth().catch(console.error);
