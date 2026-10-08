import { z } from 'zod';
const name = z.string().trim().min(2, 'Enter at least 2 characters.').max(120);
export const memberSchema = z.object({
  name, email: z.string().trim().email('Enter a valid email address.').toLowerCase().max(254),
  mobile: z.string().trim().transform(value => value.replace(/[\s()-]/g, '')).refine(value => /^\+?\d{10,15}$/.test(value), 'Enter a valid mobile number with country code.').transform(value => value.replace(/^\+/, '').length === 10 ? `+91${value.replace(/^\+/, '')}` : `+${value.replace(/^\+/, '')}`),
  institution: name, age: z.union([z.number().int().min(1).max(120), z.null()]).optional(),
});
export const registrationSchema = z.object({
  name, institution: name, category: z.enum(['College', 'School', 'Open']), members: z.array(memberSchema).min(4, 'A team needs at least 4 members.').max(6, 'A team can have at most 6 members.'),
  mentor: z.object({ name: z.string().trim().max(120), email: z.union([z.string().trim().email().toLowerCase(), z.literal('')]) }).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Accept the declaration to continue.' }) }), guardianConsent: z.boolean().default(false),
}).superRefine((data, context) => {
  if (new Set(data.members.map(member => member.email)).size !== data.members.length) context.addIssue({ code: 'custom', path: ['members'], message: 'Each member needs a different email address.' });
  if (new Set(data.members.map(member => member.mobile)).size !== data.members.length) context.addIssue({ code: 'custom', path: ['members'], message: 'Each member needs a different mobile number.' });
  if (data.members.some(member => member.age && member.age < 18) && !data.guardianConsent) context.addIssue({ code: 'custom', path: ['guardianConsent'], message: 'Confirm guardian consent for members under 18.' });
  if (data.mentor?.email && !data.mentor.name) context.addIssue({ code: 'custom', path: ['mentor'], message: 'Enter the mentor’s name.' });
});
export type RegistrationInput = z.infer<typeof registrationSchema>;
