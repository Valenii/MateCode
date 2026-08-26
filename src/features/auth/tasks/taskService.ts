import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../../services/firebase';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../../../types/task';

const DEMO_TASKS_KEY = 'matecode_demo_tasks';
const COLLECTION_NAME = 'tasks';

/**
 * Obtiene las tareas iniciales en modo Demo desde localStorage
 */
const getDemoTasks = (userId: string): Task[] => {
  try {
    const raw = localStorage.getItem(`${DEMO_TASKS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing demo tasks:', err);
  }

  // Tareas iniciales de muestra
  const initialDemo: Task[] = [
    {
      id: 'task-1',
      userId,
      title: 'Definir arquitectura de microservicios para MateCode',
      description: 'Revisar requerimientos de escalabilidad y componentes BaaS.',
      completed: false,
      priority: 'high',
      category: 'strategic',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      notifyEmail: true,
    },
    {
      id: 'task-2',
      userId,
      title: 'Configurar variables de entorno y Firebase Auth',
      description: 'Crear proyecto en consola Firebase y vincular credenciales.',
      completed: true,
      priority: 'urgent',
      category: 'work',
      dueDate: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
      notifyEmail: false,
    },
    {
      id: 'task-3',
      userId,
      title: 'Validar templates de email en AWS SES',
      description: 'Verificar remitente y credenciales IAM para entrega de correos.',
      completed: false,
      priority: 'medium',
      category: 'learning',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notifyEmail: true,
    },
  ];

  localStorage.setItem(`${DEMO_TASKS_KEY}_${userId}`, JSON.stringify(initialDemo));
  return initialDemo;
};

const saveDemoTasks = (userId: string, tasks: Task[]): void => {
  localStorage.setItem(`${DEMO_TASKS_KEY}_${userId}`, JSON.stringify(tasks));
};

/**
 * Obtiene las tareas del usuario desde Firestore o modo Demo
 */
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const tasks: Task[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        tasks.push({
          id: d.id,
          userId: data.userId,
          title: data.title,
          description: data.description || '',
          completed: Boolean(data.completed),
          priority: data.priority || 'medium',
          category: data.category || 'work',
          dueDate: data.dueDate || undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          notifyEmail: Boolean(data.notifyEmail),
        });
      });
      return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('Error fetching tasks from Firestore, using demo:', err);
    }
  }

  return getDemoTasks(userId);
};

/**
 * Suscripción en tiempo real a las tareas de un usuario en Firestore
 */
export const subscribeToTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void
): (() => void) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          tasks.push({
            id: d.id,
            userId: data.userId,
            title: data.title,
            description: data.description || '',
            completed: Boolean(data.completed),
            priority: data.priority || 'medium',
            category: data.category || 'work',
            dueDate: data.dueDate || undefined,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
            notifyEmail: Boolean(data.notifyEmail),
          });
        });
        tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(tasks);
      });
    } catch (err) {
      console.warn('Snapshot listener error, fallback to static demo fetch:', err);
    }
  }

  onUpdate(getDemoTasks(userId));
  return () => {};
};

/**
 * Crea una nueva tarea asociada al usuario
 */
export const createTask = async (userId: string, taskDTO: CreateTaskDTO): Promise<Task> => {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docData = {
        ...taskDTO,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      return {
        id: docRef.id,
        userId,
        ...taskDTO,
        createdAt: now,
        updatedAt: now,
      };
    } catch (err) {
      console.error('Error adding doc to Firestore, saving in demo storage:', err);
    }
  }

  // Modo Demo
  const current = getDemoTasks(userId);
  const newTask: Task = {
    id: `task-${Date.now()}`,
    userId,
    ...taskDTO,
    createdAt: now,
    updatedAt: now,
  };
  const updatedList = [newTask, ...current];
  saveDemoTasks(userId, updatedList);
  return newTask;
};

/**
 * Actualiza una tarea existente
 */
export const updateTask = async (
  userId: string,
  taskId: string,
  updates: UpdateTaskDTO
): Promise<void> => {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, taskId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      return;
    } catch (err) {
      console.error('Error updating task in Firestore:', err);
    }
  }

  // Modo Demo
  const current = getDemoTasks(userId);
  const updatedList = current.map((t) =>
    t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
  );
  saveDemoTasks(userId, updatedList);
};

/**
 * Elimina una tarea
 */
export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, taskId);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.error('Error deleting task in Firestore:', err);
    }
  }

  // Modo Demo
  const current = getDemoTasks(userId);
  const updatedList = current.filter((t) => t.id !== taskId);
  saveDemoTasks(userId, updatedList);
};
