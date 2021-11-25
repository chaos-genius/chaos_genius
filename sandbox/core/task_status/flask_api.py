from flask import Flask, render_template
from flask import request
app = Flask(__name__)

@app.route("/status", methods=["GET"])
def status():
    
    #mock 
    # body = request.get_json()
    mock_data = [{"kpi_id":1,
                  "kpi_name":"abc",
                  "analytics_type":"anomaly",
                  "analytics_subtask":"overall kpi - pre-processor",
                  "status":"succeeded",
                 "job_id":1,
                 "timestamp":"timestamp"}]
    
    
    
    
    # for temp_dict in mock_data:
    #     empty_keys = set(keys_list)-set(temp_dict.keys())
    #     for key in empty_keys:
    #         temp_dict[key]=""
    print(mock_data)
    return render_template('table.html',status=mock_data,title="NO")



app.run(debug=True, port=6969,host="localhost")