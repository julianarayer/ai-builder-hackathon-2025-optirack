import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  filename?: string;
  quality?: number;
  user?: {
    email?: string;
    full_name?: string;
  };
  latestRun?: any;
}

export const exportDashboardToPDF = async (
  elementId: string, 
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = `OptiRack_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`,
    quality = 0.95,
    user,
  } = options;

  try {
    // Capturar elemento HTML
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    // Converter para canvas com alta qualidade
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#fafafa',
      windowWidth: 1280,
    });

    // Calcular dimensões do PDF (A4)
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Criar PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Adicionar cabeçalho customizado
    pdf.setFontSize(18);
    pdf.setTextColor(51, 51, 51);
    pdf.text('OptiRack - Relatório de Análise', 105, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(115, 115, 115);
    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Gerado em: ${date}`, 105, 22, { align: 'center' });
    
    if (user?.full_name || user?.email) {
      pdf.text(
        `Usuário: ${user.full_name || user.email}`, 
        105, 
        27, 
        { align: 'center' }
      );
    }

    // Adicionar linha separadora
    pdf.setDrawColor(229, 229, 229);
    pdf.line(20, 30, 190, 30);

    // Adicionar imagem do dashboard
    let heightLeft = imgHeight;
    let position = 35;

    const imgData = canvas.toDataURL('image/jpeg', quality);
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position);

    // Adicionar páginas extras se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 35;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Adicionar rodapé em todas as páginas
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(163, 163, 163);
      pdf.text(
        `Página ${i} de ${pageCount} | OptiRack © ${new Date().getFullYear()}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Salvar PDF
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return Promise.reject(error);
  }
};
