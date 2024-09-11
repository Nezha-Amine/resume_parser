import win32com.client
word = win32com.client.Dispatch("Word.Application")
word.visible = 1
pdfdoc = 'C:/Users/hp/resume_parser1/backend1/pdf_service/generated/output.pdf'
todocx = 'C:/Users/hp/resume_parser1/backend1/pdf_service/generated/test.docx'
wb1 = word.Documents.Open(pdfdoc, False, False, False)
wb1.SaveAs(todocx, FileFormat=16)  # file format for docx
wb1.Close()


