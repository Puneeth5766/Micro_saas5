import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Tab,
  TabStopPosition,
  TabStopType,
  TextRun,
} from 'docx';

import { IRFPProject } from '../models/RFPProject';

const COLOR_PRIMARY = '6366F1';
const COLOR_MUTED = '6B7280';
const FONT = 'Calibri';

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: COLOR_PRIMARY,
        font: FONT,
        size: 28,
      }),
    ],
  });
}

function body(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 22,
      }),
    ],
  });
}

function requirement(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        italics: true,
        color: COLOR_MUTED,
        font: FONT,
        size: 22,
      }),
    ],
  });
}

function readExecutiveSummary(project: IRFPProject): string {
  const candidate = (project as unknown as { executiveSummary?: string }).executiveSummary;
  if (candidate && candidate.trim()) {
    return candidate.trim();
  }

  const derived = project.sections
    .map((section) => section.generatedResponse)
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .slice(0, 200)
    .join(' ')
    .trim();

  return derived || 'Executive summary was not provided.';
}

function sectionPageRef(index: number): string {
  return `${index + 4}`;
}

export async function generateDOCX(project: IRFPProject): Promise<Buffer> {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const companyName = project.companyProfile?.name || 'Your Company';
  const executiveSummary = readExecutiveSummary(project);

  const tocItems = project.sections.map((section, idx) =>
    new Paragraph({
      children: [
        new TextRun({ text: section.title, font: FONT, size: 22 }),
        new Tab(),
        new TextRun({ text: sectionPageRef(idx), font: FONT, size: 22, color: COLOR_MUTED }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 100 },
    })
  );

  const responseSectionParagraphs: Paragraph[] = [];
  for (const section of project.sections) {
    responseSectionParagraphs.push(heading(section.title));
    responseSectionParagraphs.push(requirement(`Requirement: ${section.rfpRequirement || 'Not specified.'}`));
    responseSectionParagraphs.push(body(section.generatedResponse || 'No response generated.'));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${companyName} | Page `, font: FONT, size: 20, color: COLOR_MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20, color: COLOR_MUTED }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 2200, after: 300 },
            children: [
              new TextRun({
                text: companyName,
                bold: true,
                font: FONT,
                size: 36,
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: project.title,
                font: FONT,
                size: 28,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: `Date: ${today}`, font: FONT, size: 22, color: COLOR_MUTED })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({ text: `Prepared by: ${companyName}`, font: FONT, size: 22, color: COLOR_MUTED }),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),
          heading('Table of Contents'),
          ...tocItems,
          new Paragraph({ children: [new PageBreak()] }),
          heading('Executive Summary'),
          body(executiveSummary),
          new Paragraph({ children: [new PageBreak()] }),
          ...responseSectionParagraphs,
        ],
      },
    ],
  });

  const output = await Packer.toBuffer(doc);
  return Buffer.from(output);
}
