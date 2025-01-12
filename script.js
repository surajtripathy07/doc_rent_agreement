// Helper function to convert numbers to words
function calculateEndDate(startDate, months = 11) {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date
}


document.getElementById('agreementForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Collect user inputs
  const formData = new FormData(e.target);

  // Generate today’s date dynamically
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Get the start date from the input and calculate the end date
  const startDate = new Date(formData.get('startDate')).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const endDate = calculateEndDate(formData.get('startDate')).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Collect form data
   const data = {
    today,
    owner_name: formData.get('ownerName'),
    owner_mobile_number: formData.get('ownerMobileNumber'),
    tenant_name: formData.get('tenantName'),
    tenant_father_name: formData.get('tenantFatherName'),
    tenant_age: formData.get('tenantAge'),
    tenant_address: formData.get('tenantAddress'),
    tenant_office_address: formData.get('tenantOfficeAddress'),
    tenant_adhar_number: formData.get('tenantAdharNumber'),
    tenant_pan_number: formData.get('tenantPanNumber'),
    flat_address: formData.get('flatAddress'),
    start_date: startDate,
    end_date: endDate,
    rent_amount: formData.get('rentAmount'),
    rent_amount_words: formData.get('rentAmountWords'),
    deposit_amount: formData.get('depositAmount'),
    deposit_amount_words: formData.get('depositAmountWords'),
  };

  console.log(data); // For debugging purposes

  // Fetch the template file
  const templateResponse = await fetch('./template.docx');
  const templateArrayBuffer = await templateResponse.arrayBuffer();

  // Load the template using Pizzip
  const zip = new PizZip(templateArrayBuffer);
  const doc = new window.docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Set the template variables
  doc.setData(data);

  try {
    // Render the document
    doc.render();

    // Generate the updated document as a blob
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Trigger the download
    saveAs(out, 'Rent_Agreement.docx');
  } catch (error) {
    console.error('Error generating document:', error);
    alert('Failed to generate the document. Please try again.');
  }
});

