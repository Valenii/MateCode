export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 'work' | 'personal' | 'strategic' | 'finance' | 'learning';

export type TaskFilterStatus = 'all' | 'pending' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  notifyEmail?: boolean;
}

export type CreateTaskDTO = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

export type UpdateTaskDTO = Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>;

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  completionRate: number;
}
