const request = require("supertest")
const app = require("../service.js")

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken = null;
let userID = null;

beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';

    const badTestUser = { name: 'pizza diner', email: '', password: '' };
    const wrongResponse = await request(app).post('/api/auth').send(badTestUser);
    expect(wrongResponse.status).toBe(400);

    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
  });
  
  test('login', async () => {
    const loginRes = await request(app).put('/api/auth').send(testUser);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  
    const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    expect(loginRes.body.user).toMatchObject(user);
    //obligated lint checker
    expect(testUser.password).toBe(password);

   userID = loginRes.body.user.id;

    
  });

  test("update user",async ()=>{


    
   let newEmail = testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
   let newUser = {email:`${newEmail}`, password:`${testUser.password}`};
   const loginRes = await request(app).put(`/api/auth/${userID}`).set('Authorization', `Bearer ${testUserAuthToken}`).send(newUser)

   const WrongIDRes = await request(app).put(`/api/auth/wrong`).set('Authorization', `Bearer ${testUserAuthToken}`).send(newUser)
    expect(WrongIDRes.status).toBe(403);


   expect(loginRes.body.email).toBe(newEmail);


  })



  test('logout', async () => {
    
    const loginRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`)
    .send(testUser);
    
    expect(loginRes.status).toBe(200);

    expect(loginRes.text).toBe(`{"message":"logout successful"}`);


    
  });

  //these are the first endpoints
  test('Unknown point', async () => {
    
    const loginRes = await request(app).post('/api/auth/unknown').set('Authorization', `Bearer ${testUserAuthToken}`)
    .send(testUser);
    
    expect(loginRes.status).toBe(404);

    expect(loginRes.body.message).toBe('unknown endpoint')




    
  });

   //these are the first endpoints
   test('Welcome to JWT', async () => {
    
    const loginRes = await request(app).get('/')
    
    expect(loginRes.status).toBe(200);

    expect(loginRes.body.message).toBe('welcome to JWT Pizza')

    expect(loginRes.body.version).toBe("20240518.154317");




    
  });


   //these are the first endpoints
   test('Docs', async () => {
    
    const loginRes = await request(app).get('/api/docs')

    //console.log(loginRes.body)
    
    expect(loginRes.status).toBeDefined();





    
  });


   test('Unauthorized dealer', async () => {
    

    let newEmail = testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    let newUser = {email:`${newEmail}`, password:`${testUser.password}`};
    const loginRes = await request(app).put(`/api/auth/${userID}`).set('Authorization', `Bearer sdsdwer`).send(newUser)
 
    expect(loginRes.body.message).toBe("unauthorized");





    
  });

