
The Problem: Punch List Tracker



A punch list is the last step before a project closes - every defect found, tracked to completion. Every GC in 

construction uses one. It's real, it's simple, but this schema is deceptively simple - there's a workflow constraint hiding 

in it that the spec won't hand you.


The Schema

Below is a schema for a construction punch list tracker. Your job: build it, deploy it, and tell us how you'd enhance.


 model Project {
 id String @id @default(uuid())
 name String
 address String
 status String @default("active")
 createdAt DateTime @default(now())
 items PunchItem[]
 }


 model PunchItem {
 id String @id @default(uuid())
 project Project @relation(fields: [projectId], references: [id])
 projectId String
 location String // "Unit 204 - Kitchen"
 description String // "Drywall patch needed behind door"
 status String @default("open") // "open", "in_progress", "complete"
 priority String @default("normal")
 assignedTo String?
 photo String?
 createdAt DateTime @default(now())
 }


The Spec



Build a punch list tracker for a construction project:


Requirements:

1. Create projects(TypeScript monorepo. Next.js vercel, neon(if database needed))
2. Add punch items (location, description, priority, photo)
3. Assign to workers, update status (open → in_progress → complete)
4. Dashboard: completion %, breakdown by location/priority/assignee
5. Deploy live - we need a clickable URL