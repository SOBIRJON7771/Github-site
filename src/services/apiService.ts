import { HelpRequest } from "./firebaseService";

export interface ApiApplication {
  id: string | number;
  name: string;
  body: string;
  category?: any;
  applicant?: string;
  phone1?: string;
  phone2?: string;
  status?: string;
  created_on?: string;
  video?: string;
  photo?: string;
}

// Convert external API application format to application UI HelpRequest format and vice-versa
export const mapApiAppToHelpRequest = (app: ApiApplication): HelpRequest => {
  let mappedStatus: 'open' | 'assigned' | 'completed' | 'cancelled' = 'open';
  if (app.status === 'hal_qilingan') {
    mappedStatus = 'completed';
  } else if (app.status === 'rad_etilgan') {
    mappedStatus = 'cancelled';
  } else if (app.status === 'organilib_chiqilmoqda') {
    mappedStatus = 'assigned';
  }

  const applicantName = app.applicant || "Tashqi foydalanuvchi";
  const phoneSuffix = app.phone1 ? ` (Tel: ${app.phone1})` : "";

  return {
    id: `api_${app.id}`,
    requesterId: applicantName,
    title: app.name || "Sarluhasiz Murojaat",
    description: app.body || "Tavsif berilmagan.",
    category: 'other',
    type: 'voluntary',
    budget: undefined,
    urgency: 'medium',
    status: mappedStatus,
    createdAt: app.created_on 
      ? { toMillis: () => new Date(app.created_on!).getTime(), toDate: () => new Date(app.created_on!) } 
      : { toMillis: () => Date.now(), toDate: () => new Date() },
    location: `Tashqi API - ${applicantName}${phoneSuffix}`,
  };
};

export const apiService = {
  async getApplications(): Promise<HelpRequest[]> {
    try {
      const res = await fetch("/api/pythonanywhere/application/");
      if (!res.ok) {
        throw new Error(`Xatolik statusi: ${res.status}`);
      }
      const data = await res.json();
      
      const list = Array.isArray(data) ? data : (data.results && Array.isArray(data.results)) ? data.results : [];
      return list.map((item: ApiApplication) => mapApiAppToHelpRequest(item));
    } catch (error) {
      console.error("Failed to fetch applications from PythonAnywhere API:", error);
      throw error;
    }
  },

  async createApplication(title: string, description: string, category: string, budget: number, type: string, urgency: string): Promise<HelpRequest> {
    try {
      const payload = {
        name: title,
        body: description,
        applicant: "Tashqi foydalanuvchi",
        phone1: "+998" + Math.floor(900000000 + Math.random() * 100000000).toString(),
        category: category || null
      };

      const res = await fetch("/api/pythonanywhere/application/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API xatolik: ${res.status} - ${errorText}`);
      }

      const data: ApiApplication = await res.json();
      return mapApiAppToHelpRequest(data);
    } catch (error) {
      console.error("Failed to create application on PythonAnywhere API:", error);
      throw error;
    }
  },

  async deleteApplication(apiId: string): Promise<boolean> {
    try {
      const rawId = apiId.replace("api_", "");
      const res = await fetch(`/api/pythonanywhere/application/${rawId}/`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error(`O'chirishda xatolik: status ${res.status}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete application on PythonAnywhere API:", error);
      throw error;
    }
  },

  async getCategories(): Promise<any[]> {
    try {
      const res = await fetch("/api/pythonanywhere/category/");
      if (!res.ok) {
        throw new Error(`Xatolik: status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch categories from PythonAnywhere API:", error);
      return [];
    }
  }
};
