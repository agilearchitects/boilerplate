// Libs
import { Server } from "simplyserveme";

// Apps
import { app } from "./api/server";


new Server(app).start();