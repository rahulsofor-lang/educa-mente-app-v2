import { initializeApp } from "firebase/app"; // ✅ ADICIONE ESTA LINHA
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,        // ✅ ADICIONE ESTA LINHA
  onSnapshot,
  addDoc,
  updateDoc
} from "firebase/firestore";

import { firebaseConfig } from "../firebaseConfig";

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const collections = {
  COMPANIES: "companies",
  RESPONSES: "responses",
  PROFILES: "profiles",
  REPORTS: "reports",
  PROBABILITY: "probability"
};

export const saveCompany = async (company: any) => {
  try {
    await setDoc(doc(db, collections.COMPANIES, company.id), company);
    console.log("✅ Empresa salva:", company.nomeFantasia);
  } catch (error) {
    console.error("❌ Erro ao salvar empresa:", error);
    throw error;
  }
};

export const updateCompanyData = async (id: string, data: any) => {
  try {
    const ref = doc(db, collections.COMPANIES, id);
    await updateDoc(ref, data);
    console.log("✅ Dados atualizados:", id);
  } catch (error) {
    console.error("❌ Erro ao atualizar:", error);
    throw error;
  }
};

export const subscribeCompanies = (callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, collections.COMPANIES), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (error) => {
    console.error("❌ Erro na escuta de empresas:", error);
  });
};

export const saveSurveyResponse = async (response: any) => {
  try {
    const docRef = await addDoc(collection(db, collections.RESPONSES), response);
    console.log("✅ Resposta salva ID:", docRef.id);
  } catch (error) {
    console.error("❌ Erro ao salvar resposta:", error);
    throw error;
  }
};

export const subscribeResponses = (callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, collections.RESPONSES), (snapshot) => {
    const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(list);
  }, (error) => {
    console.error("❌ Erro na escuta de respostas:", error);
  });
};

export const saveDiagnosticReport = async (companyId: string, sectorId: string, report: any) => {
  try {
    const reportId = `${companyId}_${sectorId}`;
    await setDoc(doc(db, collections.REPORTS, reportId), { ...report, companyId, sectorId });
    console.log("✅ Laudo salvo:", sectorId);
  } catch (error) {
    console.error("❌ Erro ao salvar laudo:", error);
    throw error;
  }
};

export const saveProbability = async (companyId: string, sectorId: string, scores: any) => {
  try {
    const probId = `${companyId}_${sectorId}`;
    await setDoc(doc(db, collections.PROBABILITY, probId), { scores, companyId, sectorId });
    console.log("✅ Probabilidade salva:", sectorId);
  } catch (error) {
    console.error("❌ Erro ao salvar probabilidade:", error);
    throw error;
  }
};

export const fetchAllTechnicalData = async () => {
  try {
    const reportsSnap = await getDocs(collection(db, collections.REPORTS));
    const probSnap = await getDocs(collection(db, collections.PROBABILITY));
    const reports: any = {};
    const probs: any = {};

    reportsSnap.forEach(d => {
      const data = d.data();
      if (!reports[data.companyId]) reports[data.companyId] = {};
      reports[data.companyId][data.sectorId] = [data]; 
    });

    probSnap.forEach(d => {
      const data = d.data();
      if (!probs[data.companyId]) probs[data.companyId] = {};
      probs[data.companyId][data.sectorId] = data.scores;
    });

    return { reports, probs };
  } catch (error) {
    console.error("❌ Erro ao buscar dados técnicos:", error);
    return { reports: {}, probs: {} };
  }
};

export const savePsychologistProfile = async (profile: any) => {
  try {
    await setDoc(doc(db, collections.PROFILES, "main_rt"), profile);
    console.log("✅ Perfil do RT salvo!");
  } catch (error) {
    console.error("❌ Erro ao salvar perfil RT:", error);
    throw error;
  }
};

export const fetchPsychologistProfile = async () => {
  try {
    const snap = await getDocs(collection(db, collections.PROFILES));
    const profileDoc = snap.docs.find(d => d.id === "main_rt");
    return profileDoc ? profileDoc.data() : null;
  } catch (error) {
    console.error("❌ Erro ao buscar perfil RT:", error);
    return null;
  }
};
// ===============================================
// 🔹 SALVAR LISTA GLOBAL DE FUNÇÕES DA EMPRESA
// ===============================================
export const updateCompanyFunctions = async (companyId, functions) => {
  try {
    const ref = doc(db, collections.COMPANIES, companyId);
    await updateDoc(ref, { functions });
    console.log("✅ Funções atualizadas com sucesso:", functions);
  } catch (error) {
    console.error("❌ Erro ao atualizar funções:", error);
    throw error;
  }
};

// ===============================================
// 🔹 BUSCAR LISTA GLOBAL DE FUNÇÕES DA EMPRESA
// ===============================================
export const fetchCompanyFunctions = async (companyId) => {
  try {
    const ref = doc(db, collections.COMPANIES, companyId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data().functions || [];
    }

    return [];
  } catch (error) {
    console.error("❌ Erro ao buscar funções:", error);
    return [];
  }
};
