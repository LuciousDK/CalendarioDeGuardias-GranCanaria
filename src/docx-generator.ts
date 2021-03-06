import * as docx from 'docx';
import { AlignmentType, Document, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from 'docx';
import fs from "fs";
import { Farmacia, Mes } from './renderer';
import { remote } from "electron";
const app = remote.app;

const thick = { color: "black", size: 10, style: docx.BorderStyle.THICK }
const THICKCELLBORDERS = {
    top: thick,
    right: thick,
    left: thick,
    bottom: thick
}
export async function generateDocx(data: { mes: Mes, farmacias: { [codigoFarmacia: string]: Farmacia } }, directory: string, index: string, zona:string) {

    if (!fs.existsSync(`${directory}/Guardias - ${zona}`)) {
        fs.mkdir(`${directory}/Guardias - ${zona}`, (err) => {
            if (err) {
                return console.error(err);
            }
        })
    }
    let doc = new Document();
    let mes = data.mes;
    let legend = data.farmacias;


    let rows1: TableRow[] = [];
    let rows2: TableRow[] = [];

    let headerRow = new TableRow({
        children: [
            headerCell("Día", 5),
            headerCell("Turno", 5),
            headerCell("Farmacia", 30),
            headerCell("Dirección", 60),
        ],
    });
    rows1.push(headerRow);
    rows2.push(headerRow);
    mes.dias.forEach((dia) => {
        tableBodyRow(dia.dia, legend[dia.medioDia], legend[dia.diaCompleto]).forEach((row: TableRow) => {
            if (Number.parseInt(dia.dia.replace(/[^0-9a-z-A-Z ]/g, "")) < 16)
                rows1.push(row);
            else
                rows2.push(row);
        })
    });

    let table1 = new Table({
        rows: rows1,
        width: { size: 100, type: docx.WidthType.PERCENTAGE }, 
        columnWidths: [4, 6, 35, 55]
    });
    let table2 = new Table({
        rows: rows2,
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        columnWidths: [4, 6, 35, 55]
    });
    doc.addSection({
        children: [new Paragraph({
            children: [
                new TextRun({
                    text: `Farmacias De Guardia - ${mes.mes}`,
                    bold: true,
                    size: 50, font: "Arial"
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }), table1],
    });
    let doc2 = new Document();
    doc2.addSection({
        children: [new Paragraph({
            children: [
                new TextRun({
                    text: `Farmacias De Guardia - ${mes.mes}`,
                    bold: true,
                    size: 50, font: "Arial"
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }), table2],
    });
    exportDocx(doc, `${directory}/Guardias - ${zona}/${index}${mes.mes}(1)`);
    exportDocx(doc2, `${directory}/Guardias - ${zona}/${index}${mes.mes}(2)`);
}

function exportDocx(doc: Document, name: string) {
    docx.Packer.toBuffer(doc).then(buffer => {
        fs.writeFileSync(`${name}.docx`, buffer);
    });

}



function headerCell(innerText: string, width: number): TableCell {
    return new TableCell({
        children: [new Paragraph({
            children: [
                new TextRun({
                    text: innerText,
                    size: 18, font: "Arial",
                    bold: true
                }),
            ],
            alignment: AlignmentType.CENTER
        })],
        width: { size: width, type: WidthType.PERCENTAGE },
        shading: { fill: "BFBFBF" },
        verticalAlign: VerticalAlign.CENTER
    });
}

function bodyCell(text: string): TableCell {
    return new TableCell({
        children: [new Paragraph({
            children: [
                new TextRun({
                    text: text,
                    size: 18, font: "Arial",
                }),
            ],
            alignment: AlignmentType.CENTER
        })],
        verticalAlign: VerticalAlign.CENTER
    });
}
function tableBodyRow(dia: string, medioDia: Farmacia, diaCompleto: Farmacia): TableRow[] {

    let returnData: TableRow[] = [];

    if (medioDia != null && diaCompleto == null) {
        let row = new TableRow({
            children: [],
        });
        row.addChildElement(
            bodyCell(dia));
        row.addChildElement(
            bodyCell("22H"));
        row.addChildElement(
            bodyCell(medioDia.nombre));
        row.addChildElement(
            bodyCell(medioDia.direccion));
        returnData.push(row);
        return returnData;
    } else
        if (medioDia == null && diaCompleto != null) {
            let row = new TableRow({
                children: [],
            });
            row.addChildElement(
                bodyCell(dia));
            row.addChildElement(
                bodyCell("24H"));
            row.addChildElement(
                bodyCell(diaCompleto.nombre));
            row.addChildElement(
                bodyCell(diaCompleto.direccion));

            returnData.push(row);
            return returnData;
        } else
            if (medioDia != null && diaCompleto != null) {
                let row = new TableRow({
                    children: [],
                });
                let row2 = new TableRow({
                    children: [],
                });
                row.addChildElement(
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: dia,
                                    size: 18, font: "Arial",
                                }),
                            ],
                            alignment: AlignmentType.CENTER,

                        })],
                        rowSpan: 2,
                        verticalAlign: VerticalAlign.CENTER
                    }));
                row.addChildElement(
                    bodyCell("22H"));
                row.addChildElement(
                    bodyCell(medioDia.nombre));
                row.addChildElement(
                    bodyCell(medioDia.direccion));
                row2.addChildElement(
                    bodyCell("24H"));
                row2.addChildElement(
                    bodyCell(diaCompleto.nombre));
                row2.addChildElement(
                    bodyCell(diaCompleto.direccion));
                returnData.push(row, row2);
                return returnData;
            }

    let row = new TableRow({
        children: [new TableCell({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: dia,
                            size: 18, font: "Arial",
                        }),
                    ],
                    alignment: AlignmentType.CENTER
                })],
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: "red" }
        }),
        new TableCell({
            children: [],
            shading: { fill: "red" }
        }),
        new TableCell({
            children: [],
            shading: { fill: "red" }
        }),
        new TableCell({
            children: [],
            shading: { fill: "red" }
        })]
    });
    returnData.push(row);
    return returnData;
}