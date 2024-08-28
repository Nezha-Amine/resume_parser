
import os 
from docx2pdf import convert
import fitz
from PIL import Image
import shutil
import pytesseract  
import io
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe' 

class CV2Img:

    def __init__(self, output_folder=None):
        self.setDir(output_folder)

    def setDir(self, output_folder):
        self.output_folder = output_folder

    def convert_docx_to_pdf(self, docx_file):
        # Convert DOCX to PDF and return path to the generated PDF
        pdf_file = docx_file.replace('.docx', '.pdf')
        convert(docx_file, pdf_file)
        return pdf_file

    def convert_pdf_to_image(self, pdf_file, prefix):
        # Convert each page of the PDF to an image
        doc = fitz.open(pdf_file)
        zoom = 4
        mat = fitz.Matrix(zoom, zoom)
        count = len(doc)
        
        for i in range(count):
            page = doc.load_page(i)
            pix = page.get_pixmap(matrix=mat)
            image_file = os.path.join(self.output_folder, f"{prefix}_page_{i + 1}.png")
            pix.save(image_file)
        
        doc.close()
    def contains_text(self,image):
        try:
            # Convert the image to a format that pytesseract can read
            image_stream = io.BytesIO(image)
            pil_image = Image.open(image_stream)
            
            # Perform OCR to check for text
            text = pytesseract.image_to_string(pil_image)
            return bool(text.strip())
        except Exception as e:
            print(f"Error checking image text: {e}")
            return False

    def delete_image_from_pdf(self,pdf_file):
        doc = fitz.open(pdf_file)  
        has_text = False  
        image_count = 0  
        
        # Check for text and count images  
        for page_num in range(len(doc)):  
            page = doc.load_page(page_num)  
            text = page.get_text()  
            if text.strip():  
                has_text = True  
                
            image_list = page.get_images(full=True)  
            image_count += len(image_list)  
       
        # If no text, we decide to keep the PDF as is (implying it's mostly images or scanned)  
        if not has_text:  
            return pdf_file
        else:  
            custom_config = r'--oem 3 --psm 6 -l fra'  
            
            # Iterate over each page and remove images  
            for page_num in range(len(doc)):  
                page = doc.load_page(page_num)  
                image_list = page.get_images(full=True)  
                
                for img_index, img in enumerate(image_list): 
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    if self.contains_text(image_bytes):
                        pass
                    else:
                        page.delete_image(xref)
            
            # Save the modified PDF to the output folder  
            base_name = os.path.splitext(os.path.basename(pdf_file))[0]
            os.makedirs("tmp_folder", exist_ok=True)
            temp_pdf_path = os.path.join('tmp_folder/', f"{base_name}.pdf")  
            doc.save(temp_pdf_path, garbage=3, deflate=True)  
            return temp_pdf_path



    def process(self, file_path):
        # Determine file extension
        _, extension = os.path.splitext(file_path)
        extension = extension.lower().strip('.')

        os.makedirs(self.output_folder, exist_ok=True)

        if extension == 'docx':
            # Convert DOCX to PDF, then to images
            pdf_file = self.convert_docx_to_pdf(file_path)
            pdf_file = self.delete_image_from_pdf(pdf_file) 
            self.convert_pdf_to_image(pdf_file, os.path.basename(file_path).replace('.docx', ''))
        elif extension == 'doc':
            pass
        elif extension == 'pdf':
            # Convert PDF directly to images
            file_path = self.delete_image_from_pdf(file_path) 
            self.convert_pdf_to_image(file_path, os.path.basename(file_path).replace('.pdf', ''))
        else:
            img = Image.open(file_path)
            new_image_path = os.path.join(self.output_folder, os.path.basename(file_path))
            # Save the image to the new path
            img.save(new_image_path)
                
        
    def delete_tmp_folder(self):
        shutil.rmtree("tmp_folder")


    def delete_dir(self):
        shutil.rmtree(self.output_folder)

