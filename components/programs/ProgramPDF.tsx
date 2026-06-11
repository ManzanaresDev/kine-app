// components/programs/ProgramPDF.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { Program } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { formatDuration } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 48,
    backgroundColor: "#ffffff",
    color: "#1c1917",
    fontSize: 10,
  },

  header: {
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e7e5e4",
    borderBottomStyle: "solid",
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  logo: {
    width: 20,
    height: 20,
    backgroundColor: "#0d9488",
    borderRadius: 4,
    marginRight: 8,
  },

  appName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
  },

  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 10,
    color: "#78716c",
  },

  notes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f4",
    borderRadius: 4,
    fontSize: 9,
    color: "#57534e",
    fontStyle: "italic",
  },

  table: {
    marginTop: 4,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f4",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 2,
  },

  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#78716c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e7e5e4",
    alignItems: "center",
  },

  tableRowAlt: {
    backgroundColor: "#fafaf9",
  },

  colIndex: { width: 24, flexShrink: 0 },
  colName: { flex: 1 },
  colCategory: { width: 80, flexShrink: 0 },
  colSets: { width: 50, flexShrink: 0 },
  colParam: { width: 70, flexShrink: 0 },

  exerciseName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
  },

  exerciseDesc: {
    fontSize: 8,
    color: "#78716c",
    marginTop: 2,
    lineHeight: 1.4,
  },

  categoryBadge: {
    fontSize: 8,
    color: "#0d9488",
    backgroundColor: "#f0fdfa",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },

  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e7e5e4",
    borderTopStyle: "solid",
    paddingTop: 8,
  },

  footerText: {
    fontSize: 8,
    color: "#a8a29e",
  },
});

interface ProgramPDFDocumentProps {
  program: Program;
}

export function ProgramPDFDocument({
  program,
}: ProgramPDFDocumentProps): ReactElement<DocumentProps> {
  const date = new Date(program.updatedAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const truncate = (text: string, max = 120) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logo} />
            <Text style={styles.appName}>KinéPlan</Text>
          </View>

          <Text style={styles.title}>{program.title}</Text>

          <Text style={styles.subtitle}>
            Programme du {date} · {program.exercises.length} exercice
            {program.exercises.length !== 1 ? "s" : ""}
          </Text>

          {program.notes && <Text style={styles.notes}>{program.notes}</Text>}
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <View style={styles.colIndex}>
              <Text style={styles.tableHeaderText}>#</Text>
            </View>
            <View style={styles.colName}>
              <Text style={styles.tableHeaderText}>Exercice</Text>
            </View>
            <View style={styles.colCategory}>
              <Text style={styles.tableHeaderText}>Catégorie</Text>
            </View>
            <View style={styles.colSets}>
              <Text style={styles.tableHeaderText}>Séries</Text>
            </View>
            <View style={styles.colParam}>
              <Text style={styles.tableHeaderText}>Rép. / Durée</Text>
            </View>
          </View>

          {/* Rows */}
          {program.exercises.map((pe, idx) => {
            const rowStyle =
              idx % 2 === 1
                ? [styles.tableRow, styles.tableRowAlt]
                : [styles.tableRow];

            return (
              <View key={pe.id} style={rowStyle}>
                <View style={styles.colIndex}>
                  <Text
                    style={{
                      fontFamily: "Helvetica-Bold",
                      color: "#a8a29e",
                    }}
                  >
                    {idx + 1}
                  </Text>
                </View>

                <View style={styles.colName}>
                  <Text style={styles.exerciseName}>{pe.exercise.name}</Text>

                  {pe.exercise.description && (
                    <Text style={styles.exerciseDesc}>
                      {truncate(pe.exercise.description)}
                    </Text>
                  )}
                </View>

                <View style={styles.colCategory}>
                  <Text style={styles.categoryBadge}>
                    {CATEGORY_LABELS[pe.exercise.category]}
                  </Text>
                </View>

                <View style={styles.colSets}>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "Helvetica-Bold",
                    }}
                  >
                    {pe.sets}
                  </Text>
                </View>

                <View style={styles.colParam}>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "Helvetica-Bold",
                      color: "#0d9488",
                    }}
                  >
                    {pe.duration && pe.duration > 0
                      ? formatDuration(pe.duration)
                      : pe.reps
                        ? `${pe.reps} rép.`
                        : "—"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>KinéPlan</Text>

          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />

          <Text style={styles.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}
