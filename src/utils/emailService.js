import { db } from "../components/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "../components/firebase";

export const sendWelcomeEmail = httpsCallable(functions, 'sendWelcomeEmail');