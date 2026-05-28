// src/app/api/programs/[id]/pdf/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdf } from '@react-pdf/renderer'
import { ProgramPDFDocument } from '@/components/programs/ProgramPDF'
import React from 'react'
import type { Program } from '@/types'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!program) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const serialized: Program = JSON.parse(JSON.stringify(program))

  const element = React.createElement(ProgramPDFDocument as any, { program: serialized })
  const rawBuffer: any = await pdf(element as any).toBuffer()

  // Normalize to Node Buffer regardless of what toBuffer() actually returns
  let nodeBuffer: Buffer
  if (Buffer.isBuffer(rawBuffer)) {
    nodeBuffer = rawBuffer
  } else if (rawBuffer instanceof Uint8Array) {
    nodeBuffer = Buffer.from(rawBuffer)
  } else {
    // ReadableStream fallback
    const chunks: Buffer[] = []
    for await (const chunk of rawBuffer as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk))
    }
    nodeBuffer = Buffer.concat(chunks)
  }

  const filename = `programme-${program.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`

  return new NextResponse(nodeBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
