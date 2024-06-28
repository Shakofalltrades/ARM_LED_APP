# LUMNET - Server Code (ARM Wireless Mesh LEDs Project)
### Third-year Group Project
This project deploys a mesh network (PainlessMesh) to connect nodes of Addressable LEDs to display animations across them in sync. A separate repository can be found [here](https://github.com/pb1n/LEDMeshProject) for the set up of the nodes and border-router.

#### Contributors (Server and Wesbite):
- Tina Dionysiou
- Marta Lopez Gallo
- Sakhawat Salam
- Nithi Sendhil

## Set Up

###
Prerequisites:
1. Node.js (20.13.1)
2. React (18.2.0)
3. MySQL (8.0.37)
    - Installation of Express and Multer maybe required

### [Optional] Database
Although the implementation to pull images from the database to the mesh network is not yet finished, animations created on the front-end can be stored in one. To do this, create a MySQL databse called `animations` and include the login details in the server.js file. 

### Running the Website and Servers
To run the website, use the `node start_all.js` command.
