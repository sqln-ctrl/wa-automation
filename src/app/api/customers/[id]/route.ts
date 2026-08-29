import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerById, updateCustomer } from "@/services/customer.service";

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isBlocked: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const customer = await updateCustomer(params.id, parsed.data);
  return NextResponse.json(customer);
}
