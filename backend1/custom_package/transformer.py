from pyspark.ml import Transformer
from pyspark.ml.param import Param, Params
from pyspark.sql.functions import regexp_replace
import pandas as pd
from pyspark.ml import Transformer
from pyspark.ml.param import Param, Params
from pyspark.sql.functions import regexp_replace
from custom_package import CV_2_Img , yolo , extract , model_generate
from pyspark.ml.util import MLWritable, MLReadable, DefaultParamsWritable, DefaultParamsReadable
from pyspark.sql import SparkSession
import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

class DetectRegionsText(Transformer, DefaultParamsWritable, DefaultParamsReadable):
    """
    Build a custom transformer to predict the regions of text in a resume.
    """
    inputCol = Param(Params._dummy(), "inputCol", "Input column name")
    outputCol = Param(Params._dummy(), "outputCol", "Output column name")

    def __init__(self, inputCol=None, outputCol=None):
        super(DetectRegionsText, self).__init__()
        self._setDefault(inputCol=inputCol, outputCol=outputCol)
        self.setParams(inputCol=inputCol, outputCol=outputCol)
        self.spark = SparkSession.builder \
            .appName("ResumeParserPipeline") \
            .master("local") \
            .getOrCreate()

    def setParams(self, inputCol=None, outputCol=None):
        return self._set(inputCol=inputCol, outputCol=outputCol)
    
    def convert_predictions_to_df(self, all_predictions):
        # Define the schema for the DataFrame
        predictions_list = []
        for pred in all_predictions:
            predictions_list.append({
                "path_of_image": pred['path_of_image'],
                "predictions": pred['predictions']
            })
        
        # Convert list to pandas DataFrame
        predictions_df = pd.DataFrame(predictions_list)
        return predictions_df
    
    def convert_text_to_df(self, all_text):
        # Define the schema for the DataFrame
        text_list = []
        for text in all_text:
            text_list.append({
                "path_of_image": text['path_of_image'],
                "text": text['text']
            })
        
        # Convert list to pandas DataFrame
        text_df = pd.DataFrame(text_list)
        return text_df
    
    def convert_json_to_df(self, json_response):
        # Define the schema for the DataFrame
        json_list = []
        for res in json_response:
            json_list.append({
                "path_of_image": res['path_of_image'],
                "json_res": res['res']
            })
        
        # Convert list to pandas DataFrame
        json_df = pd.DataFrame(json_list)
        return json_df

    def getInputCol(self):
        return self.getOrDefault(self.inputCol)

    def _transform(self, dataset: pd.DataFrame) -> pd.DataFrame:
        # Create an instance of CV2Img
        resume_2_Img = CV_2_Img.CV2Img(output_folder='../assets/test_pip')
         # Process each file path 
        for path in dataset[self.getInputCol()]:
            resume_2_Img.process(path)

        #  load images
        images_df = self.spark.read.format("binaryFile").option("pathGlobFilter", "*.*").load("../assets/test_pip")
        images_df_pandas = images_df.select("path").toPandas()
        images_df_pandas['path'] = images_df_pandas['path'].str.replace(r'^file:/', '', regex=True)

        # Create a new DataFrame with the modified 'path' column
        images_df = pd.DataFrame(images_df_pandas['path'])
        images_df.rename(columns={'path': 'path_of_image'}, inplace=True)


        dataset = pd.concat([dataset, images_df], axis=1)

        # Drop a single column

        # Trigger the YOLO model
        model = yolo.CustomYolo(dataset['path_of_image'])  
        predictions = model.detect()
        predictions_df = self.convert_predictions_to_df(predictions)


        yolo_df = pd.merge(dataset, predictions_df, on="path_of_image", how="left")
        
      
        # Extract 
        ExtractClass = extract.Extract(yolo_df)
        text_extracted = ExtractClass.extract()
        text_df = self.convert_text_to_df(text_extracted)
        yolo_text_df = pd.merge(yolo_df, text_df, on="path_of_image", how="left")


        # Generate Format NetSense
        load_model = model_generate.Generate(yolo_text_df)
        json_result = load_model.generate_text()
        json_df =  self.convert_json_to_df(json_result)

        final_df = pd.merge(yolo_text_df, json_df, on="path_of_image", how="left")

        results = self.spark.createDataFrame(final_df)

        return results
  
