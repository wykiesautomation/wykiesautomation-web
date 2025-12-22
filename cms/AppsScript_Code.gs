
        // Google Apps Script Web App — JSON API + Email + Invoice PDF
        // Endpoints:
        //  GET  /products   -> returns array of products from Sheet
        //  GET  /gallery    -> returns array of images from Sheet
        //  POST /products/update -> updates a row by SKU
        //  POST /gallery/add     -> appends a new gallery row
        //  POST /contact         -> sends mail to admin + optional auto-reply
        //  POST /itn             -> on verified PayFast ITN, send emails + PDF invoice

        const ADMIN_EMAIL = 'wykiesautomation@gmail.com';

        function doGet(e){
          const path = e.pathInfo || '';
          if(path === 'products') return json(getProducts());
          if(path === 'gallery') return json(getGallery());
          return json({status:'ok'});
        }

        function doPost(e){
          const path = e.pathInfo || '';
          const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
          if(path === 'products/update') return json(updateProduct(body));
          if(path === 'gallery/add') return json(addGallery(body));
          if(path === 'contact') return json(handleContact(body));
          if(path === 'itn') return json(handleITN(body));
          return json({status:'unknown_path'});
        }

        function getSheet(name){
          const ss = SpreadsheetApp.getActiveSpreadsheet();
          return ss.getSheetByName(name);
        }

        function getProducts(){
          const sh = getSheet('Products');
          const rows = sh.getDataRange().getValues();
          const [hdr,...data] = rows;
          return data.map(r=>({
            sku: r[0], name: r[1], price: r[2], image: r[3], description: r[4], trial_url: r[5]
          })).filter(x=>x.sku);
        }

        function getGallery(){
          const sh = getSheet('Gallery');
          const rows = sh.getDataRange().getValues();
          const [hdr,...data] = rows;
          return data.map(r=>({url:r[0], title:r[1], sku:r[2]})).filter(x=>x.url);
        }

        function updateProduct(p){
          const sh = getSheet('Products');
          const rows = sh.getDataRange().getValues();
          for(let i=1;i<rows.length;i++){
            if(rows[i][0]===p.sku){
              sh.getRange(i+1,2).setValue(p.name);
              sh.getRange(i+1,3).setValue(p.price);
              sh.getRange(i+1,4).setValue(p.image);
              sh.getRange(i+1,5).setValue(p.description);
              sh.getRange(i+1,6).setValue(p.trial_url);
              return {ok:true};
            }
          }
          return {ok:false};
        }

        function addGallery(g){
          const sh = getSheet('Gallery');
          sh.appendRow([g.url, g.title || '', g.sku || '']);
          return {ok:true};
        }

        function handleContact(c){
          const subject = `Wykies Automation enquiry — ${c.product || ''}`;
          const html = `
            <h3>New enquiry</h3>
            <p><b>Name:</b> ${c.name}</p>
            <p><b>Email:</b> ${c.email}</p>
            <p><b>Phone:</b> ${c.phone || ''}</p>
            <p><b>Product:</b> ${c.product || ''}</p>
            <p><b>Message:</b><br/>${(c.message||'').replace(/
/g,'<br/>')}</p>`;
          MailApp.sendEmail({ to: ADMIN_EMAIL, subject, htmlBody: html });
          if(c.copy_me){ MailApp.sendEmail({ to: c.email, subject: 'We received your enquiry', htmlBody: '<p>Thanks — we will reply soon.</p>'+html }); }
          return {ok:true};
        }

        function handleITN(payload){
          const itn = payload.itn || {};
          const sku = itn.custom_str1;
          const buyerEmail = itn.email_address || '';
          const buyerName = itn.first_name + ' ' + itn.last_name;
          // Generate a simple invoice PDF from HTML
          const html = `
            <style> body{font-family:Arial} h2{margin-bottom:0} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ccc;padding:8px} .right{text-align:right} </style>
            <h2>Invoice</h2>
            <p>Order: ${sku}</p>
            <table><tr><th>Description</th><th class="right">Amount (ZAR)</th></tr>
            <tr><td>${itn.item_name}</td><td class="right">${itn.amount}</td></tr>
            <tr><td class="right"><b>Total</b></td><td class="right"><b>${itn.amount}</b></td></tr></table>
            <p>Buyer: ${buyerName} &lt;${buyerEmail}&gt;</p>
            <p>Date: ${new Date().toISOString()}</p>`;
          const blob = Utilities.newBlob(html, MimeType.HTML, `invoice-${sku}.pdf`).getAs(MimeType.PDF);
          const subject = `Payment confirmed — ${sku}`;
          const body = `Thank you for your purchase. Invoice attached.`;
          const recipients = [ADMIN_EMAIL];
          if(buyerEmail) recipients.push(buyerEmail);
          MailApp.sendEmail({ to: recipients.join(','), subject, htmlBody: body, attachments: [blob] });
          return {ok:true};
        }

        function json(obj){
          return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
        }
