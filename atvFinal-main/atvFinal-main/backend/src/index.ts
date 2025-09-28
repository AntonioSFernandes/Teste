import { RecursoServer } from "./Recurso/RecursoServer"; 
import { MainServer } from "./http/MainServer";

RecursoServer.listen(4000, () => {
    console.log("RecursoServer running on port 4000");
});

MainServer.listen(8080, () => {
    console.log("MainServer running on port 8080");
});



