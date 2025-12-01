import express, { Request, Response } from "express";

const app = express();
app.use(express.json());
app.use(express.text({ type: "application/xml" }));

app.post("/records", (req: Request, res: Response) => {
  // Stub: create record
  res.status(201).json({ id: "stub-record-id" });
});

app.get("/records/:id/canonicalize", (req: Request, res: Response) => {
  // Stub: return canonical + hash
  res.json({ canonical: "", sha256: "" });
});

app.get("/records/:id/verify", (req: Request, res: Response) => {
  // Stub: verify signed package
  res.json({ valid: true, errors: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scaffold backend running on port ${PORT}`));
