import { db } from "../utils/firebase";
import { collection, getDoc, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";


export interface ITutorial {
    name: string;
    students: number;
    type: string;
}

export interface ITutorialDoc extends ITutorial {
    id: string;
}

const tutorialStr = "tutorials"
const tutorialCollectionRef = collection(db, tutorialStr)

class TutorialController {

    getTutorials = async () => {
        const { docs } = await getDocs(tutorialCollectionRef)
        return docs.map((doc) => {
            return { ...doc.data(), id: doc.id } as ITutorialDoc
        })
    }

    addTutorial = async (tutorial: ITutorial) => {
        return addDoc(tutorialCollectionRef, tutorial)
    }

    updateTutorial = async (id: string, tutorial: ITutorial) => {
        const tutorialDoc = doc(db, tutorialStr, id)
        return updateDoc(tutorialDoc, tutorialStr, tutorial)
    }
}

export default new TutorialController()