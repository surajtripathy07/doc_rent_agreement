// Helper function to convert numbers to words
function calculateEndDate(startDate, months = 11) {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date
}

// Function to read the image file as a base64 string
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // Remove the base64 prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

    // Read the uploaded image
  const imageFile = formData.get('imageInput');
  const imageBase64 = await readFileAsBase64(imageFile);

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
    image_placeholder: imageBase64
  };

  // Configure the image module
  const imageModule = new ImageModule({
    centered: false,
    getImage: (tag) => {
      return window.atob(data.image_placeholder);
    },
    getSize: () => [260, 331],
  });

  // Fetch the template file
  const templateResponse = await fetch('./template.docx');
  const templateArrayBuffer = await templateResponse.arrayBuffer();

  // Load the template using Pizzip
  const zip = new PizZip(templateArrayBuffer);
  const doc = new window.docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    module: [imageModule]
  })

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
    
    // Filter out sensitive fields
    const filteredData = {
      today,
      tenant_name: data.tenant_name,
      tenant_unique_number: data.tenant_adhar_number,
      stay_start_date: data.start_date,
      rent_amount: data.rent_amount
    };

    // Send filtered data to Google Analytics
    gtag('event', 'form_submission', {
      event_category: 'Rent Agreement',
      event_label: 'Agreement Generated',
      value: 1, 
      ...filteredData,
    });

  } catch (error) {
    console.error('Error generating document:', error);
    alert('Failed to generate the document. Please try again.');
      // Send failure event to Google Analytics
    gtag('event', 'form_failure', {
      event_category: 'Rent Agreement',
      event_label: 'Document Generation Failed',
      error_message: error.message,
      tenant_name: data.tenant_name,
    });
  }
});

