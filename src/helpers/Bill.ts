import { IBill } from "../models/Bill";
import { db } from "../utils/firebase";
import { collection, getDoc, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export interface IBillDoc extends IBill {
    id: string;
}

const billDatebaseName = "bills"
const billCollectionRef = collection(db, billDatebaseName)

class BillController {

    getBill = async () => {
        const { docs } = await getDocs(billCollectionRef)
        return docs.map((doc) => {
            return { ...doc.data(), id: doc.id } as IBillDoc
        })
    }

    addBill = async (bill: IBill) => {
        return addDoc(billCollectionRef, bill)
    }

    updateBill = async (id: string, bill: IBill) => {
        const tutorialDoc = doc(db, billDatebaseName, id)
        return updateDoc(tutorialDoc, billDatebaseName, bill)
    }
}

export default new BillController()