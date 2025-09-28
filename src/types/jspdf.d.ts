import 'jspdf'; // Import jspdf to augment its module

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: import('jspdf-autotable').UserOptions) => jsPDF;
  }
}