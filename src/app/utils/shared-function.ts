export function filterByName(moduleName: string,event:any,afs:any, accountFirebase:any, passID:any){
     let query;
    // Check if the name filter exists and apply it to the query
    if (event.target.value.length > 0) {
        query = afs.collection('/accounts').doc(accountFirebase)
            .collection('/variations', ref => ref
                .where("projectId", '==', passID.id)
                .where("variationsName", "==", event.target.value)
                // .where("variationsName", "==", event.target.value + '\uf8ff') // For case-insensitive search
                // .orderBy("variationsName") // First order by "name" since we're filtering it with an inequality
                // .orderBy("variantsNumber", 'desc') // Then order by "variantsNumber" for descending order
                .limit(10)
            );`                   `
    } else {
      // If no name filter is applied, fallback to a default query
      query = afs.collection('/accounts').doc(accountFirebase)
          .collection('/variations', ref => ref
              .where("projectId", '==', passID.id)
              .orderBy("variantsNumber", 'desc')  // For ordering variations by number or any other criteria
              .limit(10)
          );
  }
  return query;
}

export function createExpandableRow(cell: HTMLElement, createdAt: any) {
    if (!createdAt) {
      cell.innerHTML = 'N/A';
      return;
    }
  
    const date = createdAt.toDate();
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
    // Create the expandable row
    const expandableRow = document.createElement('div');
    expandableRow.classList.add('expandable-row');
    expandableRow.setAttribute('title', 'Click to expand');
    expandableRow.innerHTML = `<span class="fw-bold" style="cursor:pointer">${formattedDate}</span>`;
  
    let isExpanded = false;
  
    expandableRow.addEventListener('click', () => {
      isExpanded = !isExpanded;
      expandableRow.innerHTML = `<span class="fw-bold" style="cursor:pointer">${isExpanded ? date.toString() : formattedDate}</span>`;
  
      // Force tooltip update
      expandableRow.removeAttribute('title');
      setTimeout(() => {
        expandableRow.setAttribute('title', isExpanded ? 'Click to collapse' : 'Click to expand');
      }, 10);
    });
  
    cell.innerHTML = ''; // Clear the cell before appending
    cell.appendChild(expandableRow);
  }
  
export function updateRecipients(
  data_api: any, // API service
  recipientIds: string[], // List of recipient IDs
  projectId: string, // Project ID
  spinnerService: any,
  type : string, // Spinner service
  onSuccessCallback: Function, // Callback on success (to be called after successful update)
  onErrorCallback: Function // Callback on error (to be called after error occurs)
): void {
  try {
    // Show spinner while making the API call
    spinnerService.show();

    // Call the API to update RFI recipients
    data_api.updateRecipientEmails(recipientIds, projectId, type)
      .then((res: any) => {
        console.log('Response:', res);

        if (res.success) {
          onSuccessCallback(res);  // Call the success callback
        }

        spinnerService.hide();  // Hide spinner after the operation
      })
      .catch((error) => {
        console.error('Error updating Recipient Emails:', error);
        onErrorCallback(error);  // Call the error callback
        spinnerService.hide();  // Hide spinner on error
      });
  } catch (error) {
    console.error('Error in updateRecipients function:', error);
    onErrorCallback(error);  // Call the error callback
    spinnerService.hide();  // Hide spinner on error
  }
}


// CHECK EMAIL VALIDATION

export function checkValidEmail(input, Swal){
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

  if (!emailPattern.test(input)) {
    Swal.fire({
      title: "Please Enter Valid Email!",
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-success',
      },
      icon: "error"
  });
    return false;
  }
  return true;
}

// CHANGE TABLE LIMIT FUNCTION

export async function changeTableLimit(serviceFile,currentUserEmail, length, spinnerService, moduleName){
  try {
    spinnerService.show();
    await serviceFile.changeTableLimit(currentUserEmail, length, moduleName);
  } catch (error) {
    console.error("Error changing table limit:", error);
  } finally {
    spinnerService.hide();
  }
}

export async function getTableLimit(serviceFile, currentUserEmail, moduleName){
  try {
    // Fetch the table limit from your service
    const tableLimit = await serviceFile.getTableLimit(currentUserEmail, moduleName);
    return tableLimit;
  } catch (error) {
    
  } 
}