import * as v from 'valibot';

const UserSchema = v.pipe(
  v.object({
    id: v.string(),
    name: v.string(),
    email: v.pipe(v.string(), v.email()),
  }),
  v.brand('User'),
);

export type User = v.InferOutput<typeof UserSchema>;

export const createUser = (input: v.InferInput<typeof UserSchema>): User => {
  return v.parse(UserSchema, input);
};
