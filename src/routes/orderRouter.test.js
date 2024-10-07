const request = require("supertest")
const app = require("../service.js")
const { Role, DB } = require('../database/database.js');


const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };

let testUserAuthToken = null;
let userID = null;
let adminUserAuthToken = null;
let newAdminUser = null;

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  await DB.addUser(user);

  return user;
}


beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
   
    //login as admin
    newAdminUser = await createAdminUser();


    let adminRegisterRes = await request(app).put('/api/auth').send({"email":`${newAdminUser.email}`, "password":"toomanysecrets"});
    adminUserAuthToken = adminRegisterRes.body.token;

    //register new user and use his auth token probably overkill, definitely actually
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    userID = registerRes.body.id;

    
  });
  

  test("get pizza menu",async ()=>{


    const loginRes = await request(app).get(`/api/order/menu`);
    expect(loginRes.body).toBeDefined();

  })


  test("Unsuccessfully Add an item to menu",async ()=>{

    let newItemOnMenu = { "title":"Student", "description": "Everything on the burger please", "image":"nunya.png", "price": 0.0001 }
  
    const menuResponse = await request(app).put("/api/order/menu").set('Authorization', `Bearer ${testUserAuthToken}`).send(newItemOnMenu);
    
    expect(menuResponse.statusCode).toBe(403)


   
   })

   test("Successfully add an item to the menu ",async ()=>{

    //current admin user is not working so using another admin account to sign in
    // let tempUserAuthorizedToSignIn = await request(app).put('/api/auth').send({"email":"j12ehy3v3p@admin.com", "password":"toomanysecrets"});
    // let tempToken = tempUserAuthorizedToSignIn.body.token;
   // console.log(tempUserAuthorizedToSignIn.body);

    let newItemOnMenu = { "title":"Student", "description": "Everything on the burger please", "image":"nunya.png", "price": 0.0001 }
       //below covers admin login portion for the particular function
       const correctMenuResponse = await request(app).put("/api/order/menu").set('Authorization', `Bearer ${adminUserAuthToken}`).send(newItemOnMenu);
 
       expect(correctMenuResponse.statusCode).toBe(200);
     

    //    let logOutSuccessResponse = await request(app).delete('/api/auth').set("Authorization", `Bearer ${tempToken}`);
    //    expect(logOutSuccessResponse.body.message).toBe('logout successful' );
   })


   test('Create an order', async () => {

   
    let newOrder = {"franchiseId": 2, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}
    //good response
    const loginRes = await request(app).post('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`).send(newOrder)


    expect(loginRes.body.order.franchiseId).toBe(2)

    let badOrder = {"franchiseId": 2, "storeId":1,"Nah":"bad","this one has to be bad":null, "items":[{ "menuId": null, "description": "Veggie", "price": 0.05 }]}
   
    //Not authorized response
    const badRes = await request(app).post('/api/order').set('Authorization', `Bearer BADAUTH?`).send(newOrder)

    expect(badRes.status).toBe(401);

    //get 500 error code
    const badRes500 = await request(app).post('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`).send(badOrder);

    expect(badRes500.statusCode).toBe(500);

    // let logOutSuccessResponse = await request(app).delete('/api/auth').set("Authorization", `Bearer ${tempToken}`);
    // expect(logOutSuccessResponse.body.message).toBe('logout successful' );
    
  });


  test("get order from auth user",async ()=>{

  
    const menuResponse = await request(app).get("/api/order").set('Authorization', `Bearer ${testUserAuthToken}`)
    expect(menuResponse.body.dinerID).toBe(userID);
 
 
   })

  


  afterAll(async()=>{
    // //log out of admin account
    let logOutSuccessResponse = await request(app).delete('/api/auth').set("Authorization", `Bearer ${adminUserAuthToken}`);
    expect(logOutSuccessResponse.body.message).toBe('logout successful' );

    let normalUserLogOutSuccessResponse = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(normalUserLogOutSuccessResponse.body.message).toBe('logout successful' );
 

  });

