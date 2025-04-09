
# คู่มือการเปลี่ยนจากข้อมูลจำลอง (Mock Data) เป็นข้อมูลจริง (Real Data)

## วิธีการเชื่อมต่อกับ API จริง

เราได้เตรียมโครงสร้างไว้ให้แล้วในไฟล์ `src/services/shipmentService.ts` ซึ่งปัจจุบันใช้ข้อมูลจำลอง (Mock Data) เพื่อพัฒนาและทดสอบ เมื่อคุณต้องการเปลี่ยนเป็นข้อมูลจริง สามารถทำได้ดังนี้:

### 1. แก้ไขฟังก์ชัน API ในไฟล์ shipmentService.ts

เปิดไฟล์ `src/services/shipmentService.ts` และแก้ไขฟังก์ชัน `fetchShipments` และ `fetchShipmentById` ให้เชื่อมต่อกับ API จริง:

```typescript
// ดึงข้อมูลการขนส่งทั้งหมดจาก API จริง
export const fetchShipments = async (): Promise<Shipment[]> => {
  try {
    const response = await fetch('https://api.yourbackend.com/shipments', {
      headers: {
        'Authorization': `Bearer ${yourApiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch shipments:', error);
    throw error;
  }
};

// ดึงข้อมูลรายละเอียดการขนส่งจาก API จริง
export const fetchShipmentById = async (id: string): Promise<Shipment> => {
  try {
    const response = await fetch(`https://api.yourbackend.com/shipments/${id}`, {
      headers: {
        'Authorization': `Bearer ${yourApiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch shipment ${id}:`, error);
    throw error;
  }
};
```

### 2. การจัดการข้อมูลเซนเซอร์

หากมีข้อมูลจากเซนเซอร์จริง ให้แก้ไขฟังก์ชัน `generateTemperatureData` ดังนี้:

```typescript
// ดึงข้อมูลอุณหภูมิจาก API จริง
export const fetchTemperatureData = async (shipmentId: string): Promise<any[]> => {
  try {
    const response = await fetch(`https://api.yourbackend.com/shipments/${shipmentId}/temperature`, {
      headers: {
        'Authorization': `Bearer ${yourApiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch temperature data for shipment ${shipmentId}:`, error);
    throw error;
  }
};
```

แล้วอัปเดตการใช้งานใน `useShipmentDetail`:

```typescript
// ใน useShipmentDetail
const tempData = await fetchTemperatureData(id);
setTemperatureData(tempData);
```

### 3. จัดการกับการตั้งค่า API

สำหรับ API token และ URL สามารถใช้วิธีต่อไปนี้:

#### ตัวเลือก 1: ใช้ Environment Variables (แนะนำสำหรับการ Deploy)

สร้างไฟล์ `.env` ในรูทของโปรเจค (และเพิ่ม `.env` ใน `.gitignore`):

```
VITE_API_URL=https://api.yourbackend.com
VITE_API_TOKEN=your_api_token
```

แล้วเรียกใช้ใน service:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// ใช้งาน
const response = await fetch(`${API_URL}/shipments`, {
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    // ...
  }
});
```

#### ตัวเลือก 2: สร้างไฟล์คอนฟิกแยก

สร้างไฟล์ `src/config.ts`:

```typescript
export const API_CONFIG = {
  API_URL: 'https://api.yourbackend.com',
  API_TOKEN: 'your_api_token',
};
```

แล้วนำเข้าใช้งานใน service:

```typescript
import { API_CONFIG } from '../config';

// ใช้งาน
const response = await fetch(`${API_CONFIG.API_URL}/shipments`, ...);
```

### 4. ปรับ Interface ให้ตรงกับ API จริง

อย่าลืมปรับ Interface `Shipment` ใน `shipmentService.ts` ให้ตรงกับข้อมูลที่ได้จาก API จริง:

```typescript
export interface Shipment {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'issue';
  origin: string;
  destination: string;
  lastUpdated: string;
  // เพิ่มเติมหรือปรับแก้ฟิลด์ตามข้อมูลจริง
  startDate?: string;
  estimatedArrival?: string;
  minTemp?: number;
  maxTemp?: number;
  tempUnit?: string;
  // ฟิลด์เพิ่มเติมจาก API จริง
  customerId?: string;
  trackingNumber?: string;
  // ...
}
```

## การเชื่อมต่อกับฐานข้อมูล

### ตัวเลือก 1: ใช้ Supabase

[Supabase](https://supabase.io/) เป็นบริการฐานข้อมูลที่รองรับ REST API และ real-time subscriptions:

1. สร้างบัญชีและโปรเจคใน Supabase
2. สร้างตารางตามโครงสร้างข้อมูลที่ต้องการ
3. ติดตั้ง Supabase client:

```bash
npm install @supabase/supabase-js
```

4. สร้างไฟล์ `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

5. ใช้งานใน service:

```typescript
import { supabase } from '../lib/supabase';

export const fetchShipments = async (): Promise<Shipment[]> => {
  const { data, error } = await supabase
    .from('shipments')
    .select('*');
    
  if (error) throw error;
  return data || [];
};
```

### ตัวเลือก 2: ใช้ Firebase

[Firebase](https://firebase.google.com/) เป็นอีกหนึ่งตัวเลือกที่ให้บริการ real-time database:

1. สร้างโปรเจคใน Firebase
2. ติดตั้ง Firebase client:

```bash
npm install firebase
```

3. สร้างไฟล์ `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

4. ใช้งานใน service:

```typescript
import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const fetchShipments = async (): Promise<Shipment[]> => {
  const querySnapshot = await getDocs(collection(db, 'shipments'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Shipment[];
};
```

## การจัดการระบบการล็อกอิน (Authentication)

หากแอปพลิเคชันของคุณต้องการการล็อกอิน ให้เพิ่มการตรวจสอบสิทธิ์ในการเข้าถึงข้อมูล:

### ใช้ JWT (JSON Web Token)

1. สร้างไฟล์ `src/services/authService.ts` สำหรับจัดการการล็อกอิน:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch('https://api.yourbackend.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const user = await response.json();
    
    // บันทึกโทเค็นลงใน localStorage
    localStorage.setItem('authToken', user.token);
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
};
```

2. ปรับปรุงการเรียก API ให้ส่ง token:

```typescript
import { getAuthToken } from './authService';

export const fetchShipments = async (): Promise<Shipment[]> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('https://api.yourbackend.com/shipments', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  // ... ดำเนินการต่อ
};
```

## ตัวอย่างการเชื่อมต่อกับ API แบบ RESTful

นี่คือตัวอย่างการใช้งานกับ API แบบ RESTful ที่สมบูรณ์:

```typescript
// src/services/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.yourbackend.com';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  return response.json();
};

// src/services/shipmentService.ts
import { fetchWithAuth } from './api';

export const fetchShipments = async (): Promise<Shipment[]> => {
  return await fetchWithAuth('/shipments');
};

export const fetchShipmentById = async (id: string): Promise<Shipment> => {
  return await fetchWithAuth(`/shipments/${id}`);
};

export const createShipment = async (data: Omit<Shipment, 'id'>): Promise<Shipment> => {
  return await fetchWithAuth('/shipments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateShipment = async (id: string, data: Partial<Shipment>): Promise<Shipment> => {
  return await fetchWithAuth(`/shipments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteShipment = async (id: string): Promise<void> => {
  await fetchWithAuth(`/shipments/${id}`, {
    method: 'DELETE',
  });
};
```

## สรุป

1. แก้ไขไฟล์ `src/services/shipmentService.ts` เพื่อเชื่อมต่อกับ API หรือฐานข้อมูลจริง
2. ปรับ interface ให้ตรงกับข้อมูลจริง
3. จัดการกับการตั้งค่า API (URL, Token) ผ่าน environment variables หรือไฟล์คอนฟิก
4. เพิ่มการตรวจสอบสิทธิ์ถ้าจำเป็น
5. ทดสอบการเชื่อมต่อและการแสดงผลข้อมูลเพื่อให้แน่ใจว่าทุกอย่างทำงานถูกต้อง

โปรเจคนี้ได้ถูกออกแบบให้ง่ายต่อการเปลี่ยนแปลงจากข้อมูลจำลองเป็นข้อมูลจริง คุณสามารถทำการเปลี่ยนแปลงได้โดยไม่กระทบต่อส่วนอื่นๆ ของแอปพลิเคชัน
