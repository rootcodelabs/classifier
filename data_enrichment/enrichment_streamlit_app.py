import streamlit as st
import pandas as pd
import requests
from io import BytesIO

API_URL = "http://localhost:8005/paraphrase"

def paraphrase_text(text, num_return_sequences=1, language_id=None):
    response = requests.post(
        API_URL,
        json={"text": text, "num_return_sequences": num_return_sequences, "language_id": language_id},
    )
    if response.status_code == 200:
        return response.json()["paraphrases"]
    else:
        st.error(f"Error: {response.status_code} - {response.json().get('detail', 'Unknown error')}")
        return []

st.title("Syntactic Data Generator")

uploaded_file = st.file_uploader("Upload your Excel file", type=["xlsx"])

if uploaded_file:
    df = pd.read_excel(uploaded_file)
    st.write("Original Data", df)

    columns_to_paraphrase = st.multiselect("Select columns to generate syntactic data", df.columns)

    if st.button("Generate Syntactic Data"):
        new_data = df.copy()
        for column in columns_to_paraphrase:
            paraphrased_column = []
            for text in df[column]:
                paraphrased_text = paraphrase_text(text)
                paraphrased_column.append(paraphrased_text[0] if paraphrased_text else text)
            new_data[column] = paraphrased_column
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            new_data.to_excel(writer, index=False, sheet_name="Sheet1")
        output.seek(0)
        
        st.download_button(
            label="Download Synthesized Data",
            data=output,
            file_name="synthesized_data.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        st.write("Synthesized Data", new_data)
