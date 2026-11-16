import {z} from 'zod';
export const reviewSchema=z.object({
 first_name:z.string().trim().min(1).max(60),
 last_name:z.string().trim().min(1).max(60),
 country:z.string().trim().min(1).max(80),
 age:z.coerce.number().int().min(5).max(120),
 work_or_education:z.string().trim().min(1).max(150),
 likes:z.string().trim().min(1).max(2000),
 improvements:z.string().trim().min(1).max(2000),
});
export type ReviewInput=z.infer<typeof reviewSchema>;
