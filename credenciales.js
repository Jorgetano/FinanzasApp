import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBs2uiQYekh4fR3Q38T-hbqJjSnclv7gwI",
  authDomain: "finanzasapp-a5653.firebaseapp.com",
  projectId: "finanzasapp-a5653",
  storageBucket: "finanzasapp-a5653.appspot.com",
  messagingSenderId: "919874936073",
  appId: "1:919874936073:web:1f0ad29ed9dc0a05ebc7d8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Agregar una nueva deuda
export const addDeudaToFirestore = async (deuda) => {
  try {
    const docRef = await addDoc(collection(db, "Deudas"), deuda);
    console.log("Deuda guardada con ID:", docRef.id);
    return docRef.id; // Devuelve el ID generado por Firestore
  } catch (error) {
    console.error("Error al guardar la deuda:", error);
    throw error;
  }
};

// Obtener todas las deudas
export const getDeudasFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Deudas"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener las deudas:", error);
    return [];
  }
};

// Eliminar una deuda por ID
export const deleteDeudaFromFirestore = async (id) => {
  try {
    console.log("Eliminando deuda con ID:", id);
    await deleteDoc(doc(db, "Deudas", id));
    console.log("Deuda eliminada correctamente");
  } catch (error) {
    console.error("Error eliminando deuda: ", error.message);
    throw error;
  }
};

// Actualizar una deuda por ID
export const updateDeudaInFirestore = async (id, nuevaDeuda) => {
  try {
    console.log("Actualizando deuda con ID:", id);
    const deudaRef = doc(db, "Deudas", id);
    await updateDoc(deudaRef, nuevaDeuda);
    console.log("Deuda actualizada correctamente");
  } catch (error) {
    console.error("Error al actualizar la deuda: ", error.message);
    throw error;
  }
};

export { db };