import { NextResponse } from "next/server";
import axios from "axios";

const GNS3_URL = "http://192.168.56.102:80/v2";

export async function GET() {
  try {
    const { data } = await axios.get(`${GNS3_URL}/templates`);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
